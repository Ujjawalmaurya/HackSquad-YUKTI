export class SyncManager {
    private queueKey = 'offline_sync_queue';
    private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));
            // Try to sync on load if online
            if (this.isOnline) {
                this.processQueue();
            }
        }
    }

    private handleOnline() {
        this.isOnline = true;
        console.log('App is online. Processing sync queue...');
        this.processQueue();
    }

    private handleOffline() {
        this.isOnline = false;
        console.log('App is offline. Actions will be queued.');
    }

    // Queue an action (e.g., mark alert as read)
    public async queueAction(url: string, method: string, body: any, token: string) {
        if (this.isOnline) {
            try {
                await this.performRequest(url, method, body, token);
                return { success: true, queued: false };
            } catch (error) {
                console.error('Request failed, queuing action:', error);
                // Fallback to queue if request failed (maybe momentary disconnect)
                this.addToQueue({ url, method, body, token, timestamp: Date.now() });
                return { success: false, queued: true };
            }
        } else {
            this.addToQueue({ url, method, body, token, timestamp: Date.now() });
            return { success: true, queued: true };
        }
    }

    private addToQueue(item: any) {
        const queue = this.getQueue();
        queue.push(item);
        localStorage.setItem(this.queueKey, JSON.stringify(queue));
        // Optional: Notify user toast "Action queued offline"
    }

    private getQueue(): any[] {
        const queueStr = localStorage.getItem(this.queueKey);
        return queueStr ? JSON.parse(queueStr) : [];
    }

    private async processQueue() {
        const queue = this.getQueue();
        if (queue.length === 0) return;

        const remainingQueue: any[] = [];

        for (const item of queue) {
            try {
                await this.performRequest(item.url, item.method, item.body, item.token);
                console.log('Synced action:', item.url);
            } catch (error) {
                console.error('Failed to sync item:', item, error);
                // Keep in queue if it fails, maybe retry limit?
                // For now, simple retry next time
                remainingQueue.push(item);
            }
        }

        localStorage.setItem(this.queueKey, JSON.stringify(remainingQueue));

        if (remainingQueue.length === 0) {
            console.log('All offline actions synced!');
            // Optional: Notify user "Sync complete"
        }
    }

    private async performRequest(url: string, method: string, body: any, token: string) {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json();
    }
}

export const syncManager = new SyncManager();
