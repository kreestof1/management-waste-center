import api from './api';

export interface RecyclingCenter {
    _id: string;
    name: string;
    address: string;
    geo: {
        lat: number;
        lng: number;
    };
    phone?: string;
    openingHours?: Record<string, { open: string; close: string; closed: boolean }>;
    publicVisibility: boolean;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ContainerType {
    _id: string;
    label: string;
    icon?: string;
    color?: string;
}

export interface Container {
    _id: string;
    centerId: string;
    typeId: ContainerType;
    label: string;
    state: 'empty' | 'full' | 'maintenance';
    capacityLiters?: number;
    locationHint?: string;
    active: boolean;
    updatedAt: string;
}

export interface StatusEvent {
    _id: string;
    containerId: string;
    newState: 'empty' | 'full';
    authorId?: {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    source: string;
    comment?: string;
    evidence?: string;
    confidence: number;
    createdAt: string;
}

// Recycling Centers
export const getCenters = async (): Promise<RecyclingCenter[]> => {
    const response = await api.get('/centers');
    return response.data.centers || response.data;
};

export const getCenterById = async (id: string): Promise<RecyclingCenter> => {
    const response = await api.get(`/centers/${id}`);
    return response.data.center || response.data;
};

export const createCenter = async (data: {
    name: string;
    address: string;
    geo: { lat: number; lng: number };
    publicVisibility?: boolean;
    openingHours?: Array<{ day: string; open: string; close: string }>;
}): Promise<RecyclingCenter> => {
    const response = await api.post('/centers', data);
    return response.data.center;
};

export const updateCenter = async (
    id: string,
    data: {
        name?: string;
        address?: string;
        geo?: { lat: number; lng: number };
        publicVisibility?: boolean;
        openingHours?: Array<{ day: string; open: string; close: string }>;
        active?: boolean;
    }
): Promise<RecyclingCenter> => {
    const response = await api.put(`/centers/${id}`, data);
    return response.data.center;
};

export const deleteCenter = async (id: string): Promise<void> => {
    await api.delete(`/centers/${id}`);
};

// Container Types
export const getContainerTypes = async (): Promise<ContainerType[]> => {
    const response = await api.get('/container-types');
    return response.data;
};

// Containers
export const getContainersByCenter = async (centerId: string): Promise<Container[]> => {
    console.log('Fetching containers for center:', centerId);
    const response = await api.get(`/containers/center/${centerId}`);
    console.log('Containers API response:', response);
    console.log('Containers data:', response.data);
    return response.data;
};

export const getContainerById = async (id: string): Promise<Container> => {
    const response = await api.get(`/containers/${id}`);
    return response.data;
};

export const declareContainerStatus = async (
    containerId: string,
    newState: 'empty' | 'full',
    comment?: string
): Promise<void> => {
    await api.post(`/containers/${containerId}/status`, {
        newState,
        comment,
    });
};

export const getContainerHistory = async (
    containerId: string,
    limit: number = 50
): Promise<StatusEvent[]> => {
    const response = await api.get(`/containers/${containerId}/events`, {
        params: { limit },
    });
    // Backend returns { events: [...], count: number }
    return response.data.events || [];
};

// Dashboard stats (for managers)
export const getCenterStats = async (centerId: string) => {
    const response = await api.get(`/dashboard/centers/${centerId}/stats`);
    return response.data;
};

export const getCenterAlerts = async (centerId: string, alertThresholdHours: number = 24) => {
    const response = await api.get(`/dashboard/centers/${centerId}/alerts`, {
        params: { alertThresholdHours },
    });
    return response.data;
};

// Global dashboard stats (for all users)
export const getGlobalStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getRotationMetrics = async (centerId: string, days: number = 30) => {
    const response = await api.get(`/dashboard/centers/${centerId}/rotation-metrics`, {
        params: { days },
    });
    return response.data;
};

// Container Types CRUD operations (manager/superadmin only)
export const getAllContainerTypes = async (): Promise<ContainerType[]> => {
    const response = await api.get('/container-types');
    return response.data.types || [];
};

export const createContainerType = async (data: {
    label: string;
    icon?: string;
    color?: string;
}): Promise<ContainerType> => {
    const response = await api.post('/container-types', data);
    return response.data.type;
};

export const updateContainerType = async (
    id: string,
    data: { label?: string; icon?: string; color?: string }
): Promise<ContainerType> => {
    const response = await api.put(`/container-types/${id}`, data);
    return response.data.type;
};

export const deleteContainerType = async (id: string): Promise<void> => {
    await api.delete(`/container-types/${id}`);
};

export const getContainerCountByType = async (typeId: string): Promise<number> => {
    const response = await api.get(`/container-types/count/${typeId}`);
    return response.data.count || 0;
};

// Container CRUD operations (manager/superadmin only)
export const getAllContainers = async (params?: {
    search?: string;
    centerId?: string;
    typeId?: string;
    state?: string;
    page?: number;
    limit?: number;
}): Promise<{ containers: Container[]; total: number; count: number }> => {
    const response = await api.get('/containers', { params });
    return {
        containers: response.data.containers || [],
        total: response.data.total || 0,
        count: response.data.count || 0,
    };
};

export const createContainer = async (data: {
    label: string;
    centerId: string;
    typeId: string;
    capacityLiters?: number;
    locationHint?: string;
    state?: 'empty' | 'full';
}): Promise<Container> => {
    const response = await api.post('/containers', data);
    return response.data.container;
};

export const updateContainer = async (
    id: string,
    data: {
        label?: string;
        centerId?: string;
        typeId?: string;
        capacityLiters?: number;
        locationHint?: string;
    }
): Promise<Container> => {
    const response = await api.put(`/containers/${id}`, data);
    return response.data.container;
};

export const deleteContainer = async (id: string): Promise<void> => {
    await api.delete(`/containers/${id}`);
};

export const setContainerMaintenance = async (
    id: string,
    maintenance: boolean
): Promise<Container> => {
    const response = await api.post(`/containers/${id}/maintenance`, { maintenance });
    return response.data.container;
};

// Bulk operations
export const bulkSetMaintenance = async (
    containerIds: string[],
    maintenance: boolean
): Promise<{ success: number; failed: number }> => {
    const response = await api.post('/containers/bulk/maintenance', {
        containerIds,
        maintenance,
    });
    return response.data;
};

export const bulkDeleteContainers = async (
    containerIds: string[]
): Promise<{ success: number; failed: number }> => {
    const response = await api.post('/containers/bulk/delete', {
        containerIds,
    });
    return response.data;
};
