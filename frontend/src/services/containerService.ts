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
    openingHours?: Record<string, string>;
    publicVisibility: boolean;
    active: boolean;
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
    return response.data;
};

export const getCenterById = async (id: string): Promise<RecyclingCenter> => {
    const response = await api.get(`/centers/${id}`);
    return response.data;
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
    const response = await api.get(`/containers/${containerId}/history`, {
        params: { limit },
    });
    return response.data;
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

export const getRotationMetrics = async (centerId: string, days: number = 30) => {
    const response = await api.get(`/dashboard/centers/${centerId}/rotation-metrics`, {
        params: { days },
    });
    return response.data;
};
