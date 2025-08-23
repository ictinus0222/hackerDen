import { useState, useEffect, useCallback } from 'react';
import { vaultService } from '../services/vaultService';
import { useAuth } from './useAuth';

export const useVault = (teamId, hackathonId) => {
    const { user } = useAuth();
    const [secrets, setSecrets] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [userRequests, setUserRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [canManage, setCanManage] = useState(false);

    // Load team secrets
    const loadSecrets = useCallback(async () => {
        if (!teamId || !hackathonId) return;

        try {
            setLoading(true);
            setError(null);
            const teamSecrets = await vaultService.getTeamSecrets(teamId, hackathonId);
            setSecrets(teamSecrets);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [teamId, hackathonId]);

    // Load access requests (for managers)
    const loadAccessRequests = useCallback(async () => {
        if (!teamId || !hackathonId || !canManage) return;

        try {
            const requests = await vaultService.getPendingAccessRequests(teamId, hackathonId);
            setAccessRequests(requests);
        } catch (err) {
            console.error('Failed to load access requests:', err);
        }
    }, [teamId, hackathonId, canManage]);

    // Load user's access requests
    const loadUserRequests = useCallback(async () => {
        if (!user) return;

        try {
            const requests = await vaultService.getUserAccessRequests(user.$id);
            setUserRequests(requests);
        } catch (err) {
            console.error('Failed to load user requests:', err);
        }
    }, [user]);

    // Check management permissions
    const checkPermissions = useCallback(async () => {
        if (!user || !teamId || !hackathonId) return;

        try {
            const canManageVault = await vaultService.canManageVault(user.$id, teamId, hackathonId);
            setCanManage(canManageVault);
        } catch (err) {
            setCanManage(false);
        }
    }, [user, teamId, hackathonId]);

    // Create a new secret
    const createSecret = async (name, value, description = '') => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const secret = await vaultService.createSecret(
                teamId,
                hackathonId,
                name,
                value,
                description,
                user.$id,
                user.name
            );

            await loadSecrets(); // Refresh the list
            return secret;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Request access to a secret
    const requestAccess = async (secretId, justification) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const request = await vaultService.requestSecretAccess(
                secretId,
                user.$id,
                user.name,
                justification
            );

            await loadUserRequests(); // Refresh user requests
            await loadAccessRequests(); // Refresh pending requests if manager
            return request;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Handle access request (approve/deny)
    const handleAccessRequest = async (requestId, action) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const result = await vaultService.handleAccessRequest(
                requestId,
                action,
                user.$id,
                user.name
            );

            await loadAccessRequests(); // Refresh pending requests
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Get secret value
    const getSecretValue = async (secretId) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const secret = await vaultService.getSecretValue(secretId, user.$id);
            await loadSecrets(); // Refresh to update access count
            return secret;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Update secret
    const updateSecret = async (secretId, updates) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            const secret = await vaultService.updateSecret(secretId, updates, user.$id);
            await loadSecrets(); // Refresh the list
            return secret;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Delete secret
    const deleteSecret = async (secretId) => {
        if (!user) throw new Error('User not authenticated');

        try {
            setError(null);
            await vaultService.deleteSecret(secretId, user.$id);
            await loadSecrets(); // Refresh the list
            await loadAccessRequests(); // Refresh requests
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Load data on mount and when dependencies change
    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    useEffect(() => {
        loadSecrets();
    }, [loadSecrets]);

    useEffect(() => {
        loadAccessRequests();
    }, [loadAccessRequests]);

    useEffect(() => {
        loadUserRequests();
    }, [loadUserRequests]);

    return {
        secrets,
        accessRequests,
        userRequests,
        loading,
        error,
        canManage,
        createSecret,
        requestAccess,
        handleAccessRequest,
        getSecretValue,
        updateSecret,
        deleteSecret,
        refreshSecrets: loadSecrets,
        refreshRequests: loadAccessRequests
    };
};