type Factory<T> = () => T;

export class Container {
    private static instance: Container;
    private instances = new Map<string, unknown>();
    private factories = new Map<string, Factory<unknown>>();

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    bind<T>(key: string, factory: Factory<T>): this {
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

    make<T>(key: string): T {
        const factory = this.factories.get(key);
        if (!factory) {
            throw new Error(`Service "${key}" is not registered in the container`);
        }
        return factory() as T;
    }

    has(key: string): boolean {
        return this.factories.has(key);
    }

    flush(): void {
        this.instances.clear();
    }
}

export const container = Container.getInstance();
