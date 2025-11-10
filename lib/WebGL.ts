import * as THREE from 'three';

export class WebGL {
    element: Element | HTMLElement | null = null;
    width: number = 0;
    height: number = 0;
    scene: THREE.Scene | null = null;
    camera: THREE.PerspectiveCamera | null = null;
    renderer: THREE.WebGLRenderer | null = null;

    constructor(element: Element | HTMLElement | null) {
        this.element = element;
    }

    public init(): void {
        if (!this.element) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();
        this.camera.fov = 45;
        this.camera.aspect = this.width / this.height;
        this.camera.near = 0.1;
        this.camera.far = 1000000;
        this.camera.position.set(0, 0, 5);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.element.appendChild(this.renderer.domElement);
    }

    public onResize(): void {
        if (!this.element || !this.scene || !this.camera || !this.renderer) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    public onUpdate(): void {
        if (!this.element || !this.scene || !this.camera || !this.renderer) return;

        const rad = (this.camera.fov / 2) * (Math.PI / 180);
        const dist = this.height / 2 / Math.tan(rad);
        this.camera.position.z = dist;

        this.renderer.render(this.scene, this.camera);
    }
}

export class _Image {
    scene: THREE.Scene | null = null;
    element: HTMLImageElement | null = null;

    geometry: THREE.PlaneGeometry | null = null;
    material: THREE.ShaderMaterial | null = null;
    mesh: THREE.Mesh | null = null;

    texture: THREE.Texture | null = null;

    constructor(scene: THREE.Scene | null, element: HTMLImageElement | null) {
        this.scene = scene;
        this.element = element;
    }

    public init(): void {
        if (!this.scene || !this.element) return;

        this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
        this.texture = new THREE.TextureLoader().load(this.element.dataset.src || '');
        // this.texture.colorSpace = THREE.SRGBColorSpace;
        this.material = new THREE.ShaderMaterial({
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float uProgress;
        void main() {
        vec4 color1 = texture2D(uTexture, vUv);
          vec4 color2 = texture2D(uTexture, vec2(uProgress, vUv.y));
          vec4 final = mix(color2, color1, step(vUv.x, uProgress));
          gl_FragColor = final;
        }
      `,
            transparent: true,
            uniforms: {
                uTexture: {
                    value: this.texture,
                },
                uProgress: {
                    value: 0,
                }
            },
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.element.addEventListener("mouseenter", () => {
            if(this.material) this.material.uniforms.uProgress.value = 0;
        });

        const rect = this.element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const x = rect.x - window.innerWidth / 2 + width / 2;
        const y = rect.y + window.scrollY - window.innerHeight / 2 + height / 2;

        // Update position and scale
        if (this.mesh) {
            this.mesh.position.set(x, -y, 0);
            this.mesh.scale.set(width, height, 1);
        }
    }

    public onResize(): void {
        if (!this.scene || !this.element || !this.mesh) return;

        const rect = this.element.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const x = rect.x - window.innerWidth / 2 + width / 2;
        const y = rect.y + window.scrollY - window.innerHeight / 2 + height / 2;

        this.mesh.position.set(x, -y, 0);
        this.mesh.scale.set(width, height, 1);
    }

    public onUpdate(): void {
        if (!this.scene || !this.element || !this.mesh) return;
        if (this.material && this.material.uniforms.uProgress.value < 1) {
            this.material.uniforms.uProgress.value += 1 / 45;
        }
    }
}

export class Image {
    scene: THREE.Scene | null = null;
    elements: NodeListOf<HTMLImageElement> | null = null;
    images: _Image[] = [];

    constructor(scene: THREE.Scene | null, elements: NodeListOf<HTMLImageElement> | null) {
        this.scene = scene;
        this.elements = elements;
    }

    public init(): void {
        if (!this.scene || !this.elements) return;
        this.elements.forEach((element) => {
            const image = new _Image(this.scene, element);
            image.init();
            this.images.push(image);
        });
    }

    public onResize():void {
        this.images.forEach((image) => {
            image.onResize();
        });
    }

    public onUpdate():void {
        this.images.forEach((image) => {
            image.onUpdate();
        });
    }
}