"use strict";
// Adapted from http://beautifl.net/?id=1073
{
	class Noise {
		// http://mrl.nyu.edu/~perlin/noise/
		constructor(setup) {
			this.p = new Uint8Array(512);
			this.octaves = setup.octaves || 1;
			this.init();
		}
		init() {
			const p = new Uint8Array(256);
			for (let i = 0; i < 256; i++) p[i] = i;
			for (let i = 255; i > 0; i--) {
				const n = Math.floor((i + 1) * Math.random());
				const q = p[i];
				p[i] = p[n];
				p[n] = q;
			}
			for (let i = 0; i < 512; i++) {
				this.p[i] = p[i & 255];
			}
		}
		lerp(t, a, b) {
			return a + t * (b - a);
		}
		grad2d(i, x, y) {
			const v = (i & 1) === 0 ? x : y;
			return (i & 2) === 0 ? -v : v;
		}
		noise2d(x2d, y2d) {
			const X = Math.floor(x2d) & 255;
			const Y = Math.floor(y2d) & 255;
			const x = x2d - Math.floor(x2d);
			const y = y2d - Math.floor(y2d);
			const fx = (3 - 2 * x) * x * x;
			const fy = (3 - 2 * y) * y * y;
			const p0 = this.p[X] + Y;
			const p1 = this.p[X + 1] + Y;
			return this.lerp(
				fy,
				this.lerp(
					fx,
					this.grad2d(this.p[p0], x, y),
					this.grad2d(this.p[p1], x - 1, y)
				),
				this.lerp(
					fx,
					this.grad2d(this.p[p0 + 1], x, y - 1),
					this.grad2d(this.p[p1 + 1], x - 1, y - 1)
				)
			);
		}
		noise(x, y) {
			let e = 1,
				k = 1,
				s = 0;
			for (let i = 0; i < this.octaves; ++i) {
				e *= 0.5;
				s += e * (1 + this.noise2d(k * x, k * y)) / 2;
				k *= 2;
			}
			return s;
		}
	}
	// init canvas
	const canvas = {
		init() {
			this.elem = document.createElement("canvas");
			document.body.appendChild(this.elem);
			this.resize();
			window.addEventListener("resize", () => this.resize(), false);
			return this.elem.getContext("2d");
		},
		resize() {
			this.width = this.elem.width = this.elem.offsetWidth;
			this.height = this.elem.height = this.elem.offsetHeight;
		}
	};
	// init pen
	const ctx = canvas.init();
	const perlin = new Noise({ octaves: 2 });
	let timeStep = 0;
	// main loop
	const run = () => {
		requestAnimationFrame(run);
		ctx.drawImage(canvas.elem, 0, -1);
		ctx.fillStyle = "#fff";
		ctx.strokeStyle = "#000";
		ctx.beginPath();
		ctx.moveTo(0, canvas.height);
		for (let x = 0; x < canvas.width; x++) {
			ctx.lineTo(
				x,
				-224 +
					canvas.height +
					0.5 *
						(Math.floor(2048 * perlin.noise(x * 0.00618, timeStep)) &
							(32 + 64 + 128 + 256))
			);
		}
		ctx.lineTo(canvas.width, canvas.height);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		timeStep += 0.01;
	};
	run();
}