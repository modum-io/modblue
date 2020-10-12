export abstract class Gatt {
	protected _mtu: number;
	public get mtu() {
		return this._mtu;
	}

	public constructor() {
		this._mtu = null;
	}

	public toString() {
		return JSON.stringify({
			mtu: this.mtu
		});
	}
}
