import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Container from '../models/Container';
import StatusEvent from '../models/StatusEvent';
import RecyclingCenter from '../models/RecyclingCenter';

/**
 * Get statistics for a recycling center
 * @route GET /api/dashboard/centers/:centerId/stats
 * @access Manager, Superadmin
 */
export const getCenterStats = async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.params;

    // Verify center exists
    const center = await RecyclingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({ message: 'Centre de recyclage introuvable' });
    }

    // Check authorization (manager can only access their own centers)
    if (req.user?.role === 'manager' && !req.user.centerIds?.includes(centerId)) {
      return res.status(403).json({ message: 'Accès refusé à ce centre' });
    }

    // Get container counts by state
    const containersByState = await Container.aggregate([
      { $match: { centerId: centerId, active: true } },
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
        },
      },
    ]);

    const stateCounts = {
      empty: 0,
      full: 0,
      maintenance: 0,
    };

    containersByState.forEach((item) => {
      stateCounts[item._id as keyof typeof stateCounts] = item.count;
    });

    const totalContainers = Object.values(stateCounts).reduce((a, b) => a + b, 0);
    const fillRate = totalContainers > 0 ? (stateCounts.full / totalContainers) * 100 : 0;

    // Get container counts by type
    const containersByType = await Container.aggregate([
      { $match: { centerId: centerId, active: true } },
      {
        $lookup: {
          from: 'containertypes',
          localField: 'typeId',
          foreignField: '_id',
          as: 'type',
        },
      },
      { $unwind: '$type' },
      {
        $group: {
          _id: '$typeId',
          typeName: { $first: '$type.label' },
          total: { $sum: 1 },
          empty: {
            $sum: { $cond: [{ $eq: ['$state', 'empty'] }, 1, 0] },
          },
          full: {
            $sum: { $cond: [{ $eq: ['$state', 'full'] }, 1, 0] },
          },
          maintenance: {
            $sum: { $cond: [{ $eq: ['$state', 'maintenance'] }, 1, 0] },
          },
        },
      },
      { $sort: { typeName: 1 } },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await StatusEvent.countDocuments({
      containerId: {
        $in: await Container.find({ centerId, active: true }).distinct('_id'),
      },
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get today's activity
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayActivity = await StatusEvent.countDocuments({
      containerId: {
        $in: await Container.find({ centerId, active: true }).distinct('_id'),
      },
      createdAt: { $gte: todayStart },
    });

    res.json({
      centerId,
      centerName: center.name,
      summary: {
        totalContainers,
        emptyContainers: stateCounts.empty,
        fullContainers: stateCounts.full,
        maintenanceContainers: stateCounts.maintenance,
        fillRate: Math.round(fillRate * 10) / 10, // Round to 1 decimal
      },
      byType: containersByType,
      activity: {
        today: todayActivity,
        last7Days: recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching center stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

/**
 * Get alerts for a recycling center (full containers exceeding threshold)
 * @route GET /api/dashboard/centers/:centerId/alerts
 * @access Manager, Superadmin
 * @query alertThresholdHours - Hours before alerting on full container (default: 24)
 */
export const getAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.params;
    const alertThresholdHours = parseInt(req.query.alertThresholdHours as string) || 24;

    // Verify center exists
    const center = await RecyclingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({ message: 'Centre de recyclage introuvable' });
    }

    // Check authorization
    if (req.user?.role === 'manager' && !req.user.centerIds?.includes(centerId)) {
      return res.status(403).json({ message: 'Accès refusé à ce centre' });
    }

    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - alertThresholdHours);

    // Find all full containers
    const fullContainers = await Container.find({
      centerId,
      state: 'full',
      active: true,
    }).populate('typeId', 'label icon color');

    // Get the last status event for each full container to determine how long it's been full
    const alerts = [];

    for (const container of fullContainers) {
      const lastFullEvent = await StatusEvent.findOne({
        containerId: container._id,
        newState: 'full',
      })
        .sort({ createdAt: -1 })
        .populate('authorId', 'firstName lastName');

      if (lastFullEvent && lastFullEvent.createdAt <= thresholdDate) {
        const hoursFull = Math.floor(
          (Date.now() - lastFullEvent.createdAt.getTime()) / (1000 * 60 * 60)
        );

        alerts.push({
          containerId: container._id,
          containerLabel: container.label,
          containerType: container.typeId,
          location: container.locationHint,
          fullSince: lastFullEvent.createdAt,
          hoursFull,
          declaredBy: lastFullEvent.authorId
            ? {
                id: (lastFullEvent.authorId as any)._id,
                name: `${(lastFullEvent.authorId as any).firstName} ${(lastFullEvent.authorId as any).lastName}`,
              }
            : null,
          severity:
            hoursFull > alertThresholdHours * 2
              ? 'critical'
              : hoursFull > alertThresholdHours
              ? 'warning'
              : 'info',
        });
      }
    }

    // Sort by hours full (most critical first)
    alerts.sort((a, b) => b.hoursFull - a.hoursFull);

    res.json({
      centerId,
      centerName: center.name,
      alertThresholdHours,
      totalAlerts: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des alertes' });
  }
};

/**
 * Get rotation metrics for a recycling center
 * Calculates average time between empty -> full and full -> empty transitions
 * @route GET /api/dashboard/centers/:centerId/rotation-metrics
 * @access Manager, Superadmin
 * @query days - Number of days to analyze (default: 30)
 */
export const getRotationMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    // Verify center exists
    const center = await RecyclingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({ message: 'Centre de recyclage introuvable' });
    }

    // Check authorization
    if (req.user?.role === 'manager' && !req.user.centerIds?.includes(centerId)) {
      return res.status(403).json({ message: 'Accès refusé à ce centre' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all containers for this center
    const containers = await Container.find({ centerId, active: true });
    const containerIds = containers.map((c) => c._id);

    // Get all status events in the time range
    const events = await StatusEvent.find({
      containerId: { $in: containerIds },
      createdAt: { $gte: startDate },
    })
      .sort({ containerId: 1, createdAt: 1 })
      .populate('containerId', 'label typeId')
      .populate('typeId', 'label');

    // Calculate rotation times
    const fillTimes: number[] = []; // Time from empty to full
    const emptyTimes: number[] = []; // Time from full to empty
    const containerMetrics: { [key: string]: any } = {};

    let currentContainer: any = null;
    let lastEmptyTime: Date | null = null;
    let lastFullTime: Date | null = null;

    for (const event of events) {
      const containerIdStr = event.containerId._id.toString();

      // Initialize container tracking
      if (currentContainer !== containerIdStr) {
        currentContainer = containerIdStr;
        lastEmptyTime = event.newState === 'empty' ? event.createdAt : null;
        lastFullTime = event.newState === 'full' ? event.createdAt : null;

        if (!containerMetrics[containerIdStr]) {
          containerMetrics[containerIdStr] = {
            containerId: (event.containerId as any)._id,
            containerLabel: (event.containerId as any).label,
            fillCount: 0,
            emptyCount: 0,
            avgFillTimeHours: 0,
            avgEmptyTimeHours: 0,
          };
        }
        continue;
      }

      // Track empty -> full transition
      if (event.newState === 'full' && lastEmptyTime) {
        const hours = (event.createdAt.getTime() - lastEmptyTime.getTime()) / (1000 * 60 * 60);
        fillTimes.push(hours);
        containerMetrics[containerIdStr].fillCount++;
        lastFullTime = event.createdAt;
        lastEmptyTime = null;
      }

      // Track full -> empty transition
      if (event.newState === 'empty' && lastFullTime) {
        const hours = (event.createdAt.getTime() - lastFullTime.getTime()) / (1000 * 60 * 60);
        emptyTimes.push(hours);
        containerMetrics[containerIdStr].emptyCount++;
        lastEmptyTime = event.createdAt;
        lastFullTime = null;
      }

      // Update state tracking
      if (event.newState === 'empty') {
        lastEmptyTime = event.createdAt;
      } else if (event.newState === 'full') {
        lastFullTime = event.createdAt;
      }
    }

    // Calculate averages
    const avgFillTime = fillTimes.length > 0 ? fillTimes.reduce((a, b) => a + b, 0) / fillTimes.length : 0;
    const avgEmptyTime = emptyTimes.length > 0 ? emptyTimes.reduce((a, b) => a + b, 0) / emptyTimes.length : 0;

    // Calculate per-container averages
    Object.values(containerMetrics).forEach((metric: any) => {
      const containerFillTimes = fillTimes.filter((_, i) => i < metric.fillCount);
      const containerEmptyTimes = emptyTimes.filter((_, i) => i < metric.emptyCount);

      metric.avgFillTimeHours =
        containerFillTimes.length > 0
          ? Math.round((containerFillTimes.reduce((a, b) => a + b, 0) / containerFillTimes.length) * 10) / 10
          : 0;

      metric.avgEmptyTimeHours =
        containerEmptyTimes.length > 0
          ? Math.round((containerEmptyTimes.reduce((a, b) => a + b, 0) / containerEmptyTimes.length) * 10) / 10
          : 0;
    });

    res.json({
      centerId,
      centerName: center.name,
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
      overall: {
        totalTransitions: fillTimes.length + emptyTimes.length,
        fillTransitions: fillTimes.length,
        emptyTransitions: emptyTimes.length,
        avgFillTimeHours: Math.round(avgFillTime * 10) / 10,
        avgEmptyTimeHours: Math.round(avgEmptyTime * 10) / 10,
      },
      byContainer: Object.values(containerMetrics).filter(
        (m: any) => m.fillCount > 0 || m.emptyCount > 0
      ),
    });
  } catch (error) {
    console.error('Error fetching rotation metrics:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des métriques de rotation' });
  }
};
