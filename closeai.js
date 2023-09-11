import { fetchEventSource } from '@waylaidwanderer/fetch-event-source';

export class GPT4 {
    constructor(apikey) {
        this.apikey = apikey;
        this.headers = {
            "Authorization": apikey,
            "Content-Type": "application/json"
        };
    }

    async ask(messages, onupdate) {
        const data = {
            "model": "gpt-4",
            "stream": true,
            "messages": messages
        };

        const options = {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data),
        };

        try {
            let reply = '';
            const controller = new AbortController();
            const response = await fetchEventSource('https://не-твоё-дело.понос.орг.рус/v1/chat', {
                ...options,
                signal: controller.signal,
                onmessage: (message) => {
                    if (message.data === '[DONE]') {
                        controller.abort();
                        return;
                    }
                    const data = JSON.parse(message.data).reply || '';
                    reply += data;
                    if (onupdate) {
                        onupdate(data);
                    }
                },
            });
            messages.push({
                "role": "assistant",
                "content": reply
            })
            return { response: reply, messages: messages };
        } catch (error) {
            return { response: ``, messages: [], error: error.message };
        }
    }
}

export class ChatGPT {
    constructor(apikey) {
        this.apikey = apikey;
        this.headers = {
            "Authorization": apikey,
            "Content-Type": "application/json"
        };
    }

    async ask(messages, onupdate) {
        const data = {
            "model": "gpt-3.5-turbo",
            "stream": true,
            "messages": messages
        };

        const options = {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data),
        };

        try {
            let reply = '';
            const controller = new AbortController();
            const response = await fetchEventSource('https://не-твоё-дело.понос.орг.рус/v1/chat', {
                ...options,
                signal: controller.signal,
                onmessage: (message) => {
                    if (message.data === '[DONE]') {
                        controller.abort();
                        return;
                    }
                    const data = JSON.parse(message.data).reply || '';
                    reply += data;
                    if (onupdate) {
                        onupdate(data);
                    }
                },
            });
            messages.push({
                "role": "assistant",
                "content": reply
            })
            return { response: reply, messages: messages };
        } catch (error) {
            return { error: error.message };
        }
    }
}

