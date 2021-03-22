import { inspect } from 'util';
/**
 * A local or remote GATT server.
 */
export class Gatt {
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {};
    }
    [inspect.custom](depth, options) {
        const name = this.constructor.name;
        if (depth < 0) {
            return options.stylize(`[${name}]`, 'special');
        }
        const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1 };
        const padding = ' '.repeat(name.length + 1);
        const inner = inspect(this.toJSON(), newOptions).replace(/\n/g, `\n${padding}`);
        return `${options.stylize(name, 'special')} ${inner}`;
    }
}
//# sourceMappingURL=Gatt.js.map