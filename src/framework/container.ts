type Factory<T> = () => T;

class Container {
    private instances = new Map<string, unknown>();
    private factories = new Map<string, Factory<unknown>>();

    register<T>(key: string, factory: Factory<T>): this {
        this.factories.set(key, factory);
        return this;
    }

    singleton<T>(key: string, factory: Factory<T>): this {
        this.factories.set(key, () => {
            if (!this.instances.has(key)) {
                this.instances.set(key, factory());
            }
            return this.instances.get(key);
        });
        return this;
    }

    get<T>(key: string): T {
        const factory = this.factories.get(key);
        if (!factory) throw new Error(`Service "${key}" not registered`);
        return factory() as T;
    }

    has(key: string): boolean {
        return this.factories.has(key);
    }
}

export const container = new Container();
export { Container };
