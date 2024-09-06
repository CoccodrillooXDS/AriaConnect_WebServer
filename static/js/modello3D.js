addEventListener("DOMContentLoaded", (event) => {

    var canvas = document.getElementById("renderModel");
    var engine = new BABYLON.Engine(canvas, true);
    
    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
    
        var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
    
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;
    
        // Load the 3D model
        BABYLON.SceneLoader.Append("/static/3Dmodels/bar/", "donut_cafe.glb", scene, function (scene) {
            scene.createDefaultCameraOrLight(true, true, true);
            scene.activeCamera.alpha += Math.PI;
        });
    
        return scene;
    };
    
    var scene = createScene();
    
    engine.runRenderLoop(function () {
        scene.render();
    });
    
    window.addEventListener("resize", function () {
        engine.resize();
    });



});

