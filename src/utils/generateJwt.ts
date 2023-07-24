import jwt from '@tsndr/cloudflare-worker-jwt';
import { env } from '../types/global.types';

export const generateJwt = async (env: env) => {
	try{
        const authToken = await jwt.sign(
            { 
                name: 'Cron Job Handler', 
                exp: Math.floor(Date.now() / 1000) + 2 
            }, 
            env.CRON_JOB_PRIVATE_KEY, 
            {algorithm: 'RS256',}
        );
    
        return authToken;
    } catch (err) {
        throw new Error("Error in generating the auth token");
    }
};
