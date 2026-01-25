import type { EventDefinition, EventHandler, EventName } from "./types";

class EventBuilder<K extends EventName> implements EventDefinition<K> {
    name: K;
    once: boolean = false;
    handler: EventHandler<K>;

    constructor(name: K) {
        this.name = name;
        this.handler = (() => {}) as EventHandler<K>;
    }

    runOnce(): this {
        this.once = true;
        return this;
    }

    execute(handler: EventHandler<K>): this {
        this.handler = handler;
        return this;
    }
}

export function event<K extends EventName>(name: K): EventBuilder<K> {
    return new EventBuilder(name);
}
