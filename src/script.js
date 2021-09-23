import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as CANNON from 'cannon-es'
import cannonDebugger from 'cannon-es-debugger'
const canvas = document.querySelector('.webgl')


class NewScene{
    constructor(){
        this._Init()
    }
    
    _Init(){
        this.scene = new THREE.Scene()
        this.clock = new THREE.Clock()
        this.oldElapsedTime = 0
        this.text
        this.InitPhysics()
        this.InitPhysicsDebugger()
        this.InitEnv()
        this.InitFont()
        this.InitCamera()
        this.InitLights()
        this.InitRenderer()
        this.InitControls()
        this.Update()
        window.addEventListener('resize', () => {
            this.Resize()
        })
    }

    InitPhysics(){
        this.world = new CANNON.World()
        this.world.gravity.set(0, -9.82, 0)
        this.world.defaultContactMaterial = this.defaultContactMaterial

        this.defaultMaterial = new CANNON.Material('default')
        this.defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial, 
            this.defaultMaterial,
            {
                friction: 0.1,
                restitution: 0.8
            }
        )
        this.world.addContactMaterial(this.defaultContactMaterial)

        this.boxShape = new CANNON.Box(new CANNON.Vec3(1.25, 0.5, 0.1))
        this.boxBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 0),
            shape: this.boxShape,
            material: this.defaultMaterial
        })
        this.world.addBody(this.boxBody)

        this.floorShape = new CANNON.Plane()
        this.floorBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, -2, 0),
            shape: this.floorShape,
            material: this.defaultMaterial

        })
        this.floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
        this.world.addBody(this.floorBody)
    }

    InitPhysicsDebugger(){
        cannonDebugger(
            this.scene, 
            this.world.bodies,
            {
                color: 0xff0000,
                autoUpdate: true
            }
        )
    }

    InitEnv(){
        this.planeGeometry = new THREE.PlaneBufferGeometry(8, 8)
        this.planeMaterial = new THREE.MeshNormalMaterial()
        this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.scene.add(this.plane)
        this.plane.rotation.x = -Math.PI * 0.5
        this.plane.position.set(0, -2, 0)
    }

    InitFont(){
        this.fontLoader = new THREE.FontLoader()
        this.objectsToUpdate = []
        this.createText = () => {
            this.fontLoader.load(
            'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/gentilis_regular.typeface.json',
            (font) => {
                this.textParameters = {
                    font: font,
                    size: 0.5,
                    height: 0.1,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 5
                }
                this.textGeometry = new THREE.TextGeometry(
                'THREE.js',
                this.textParameters
                )
                this.textMaterial = new THREE.MeshNormalMaterial()
                this.text = new THREE.Mesh(this.textGeometry, this.textMaterial)
                this.scene.add(this.text)
                this.textGeometry.computeBoundingBox()
                this.textGeometry.center()
                this.text.position.set(0, 0.7, 0)
            })  
        }
       this.createText()  
    }

    
    
    InitRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        })
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.render(this.scene, this.camera)
    }

    InitCamera(){
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 100)
        this.camera.position.set(0, 0, 5)
        this.scene.add(this.camera)
    }

    InitLights(){
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
        this.scene.add(this.ambientLight)
    }

    InitControls(){
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
        this.controls.update()
    }

    Resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    Update(){
        requestAnimationFrame(() => {   
            this.elapsedTime = this.clock.getElapsedTime()
            this.delatTime = this.elapsedTime - this.oldElapsedTime
            this.oldElapsedTime = this.elapsedTime
            
            this.world.step(1/60, this.delatTime, 3)

            if (this.text !== undefined){
                this.text.position.copy(this.boxBody.position)
                this.text.quaternion.copy(this.boxBody.quaternion)
            }
            
            this.renderer.render(this.scene, this.camera)
            this.controls.update()
            this.Update()
        })  
    }
}

let _APP = null

window.addEventListener('DOMContentLoaded', () => {
    _APP = new NewScene()
})