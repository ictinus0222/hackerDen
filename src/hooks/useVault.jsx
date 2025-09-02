import { useState, useEffect, useCallback } from 'react';
import { vaultService } from '../services/vaultService';
import { useAuth } from './useAuth';

export const useVault = (teamId, hackathonId) => {
    const { user } = useAuth();
    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            const secret = await vaultService.updateSecret(secretId, updates, user.$id, user.name);
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
            await vaultService.deleteSecret(secretId, user.$id, user.name);
            await loadSecrets(); // Refresh the list
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Load data on mount and when dependencies change
    useEffect(() => {
        loadSecrets();
    }, [loadSecrets]);

    return {
        secrets,
        loading,
        error,
        createSecret,
        getSecretValue,
        updateSecret,
        deleteSecret,
        refreshSecrets: loadSecrets
    };
};