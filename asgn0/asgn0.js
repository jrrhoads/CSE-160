// asgn0.js 

function main() {
    // Retrieve the <canvas> element
    var canvas = document.getElementById('cnvs'); 
    var drawBtn = document.getElementById('drawBtn');
    var drawBtn2 = document.getElementById('drawBtn2');

    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element ');
        return false; 
    }

    // Get the rendering context for 2DCG 
    var ctx = canvas.getContext('2d');

    //Fill canvas with black
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height); 


    drawBtn.onclick = function handleDrawEvent(){

        //Fill canvas with black
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let v1x = Number(document.getElementById('v1x').value);
        let v1y = Number(document.getElementById('v1y').value);
        let v2x = Number(document.getElementById('v2x').value);
        let v2y = Number(document.getElementById('v2y').value);

        let v1 = new Vector3([v1x, v1y, 0]);
        let v2 = new Vector3([v2x, v2y, 0]);
        
        drawVector(v1, 'red');
        drawVector(v2, 'blue');

    };

    drawBtn2.onclick = function handleDrawOperationEvent(){

        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let v1x = Number(document.getElementById('v1x').value);
        let v1y = Number(document.getElementById('v1y').value);
        let v2x = Number(document.getElementById('v2x').value);
        let v2y = Number(document.getElementById('v2y').value);

        let v1 = new Vector3([v1x, v1y, 0]);
        let v2 = new Vector3([v2x, v2y, 0]);
        let v3 = new Vector3;
        let v4 = new Vector3;
        
        drawVector(v1, 'red');
        drawVector(v2, 'blue');
        
        var operation = document.getElementById('opSel').value;
        var scalar = Number(document.getElementById('scalar').value);

        if (operation == 'add'){
            v3 = v1.add(v2);
            drawVector(v3, 'green');
        }

        else if (operation == 'sub'){
            v3 = v1.sub(v2);
            drawVector(v3, 'green');
        }

        else if (operation == 'mul'){
            v3 = v1.mul(scalar);
            v4 = v2.mul(scalar);
            drawVector(v3, 'green');
            drawVector(v4, 'green');
        }

        else if (operation == 'div'){
            if (scalar != 0){ //I already added a div by 0 check, but just in case
                v3 = v1.div(scalar);
                v4 = v2.div(scalar);
            }
            else{
                v3 = new Vector3([0, 0, 0]);
                v4 = new Vector3([0, 0, 0]);
            }
            drawVector(v3, 'green');
            drawVector(v4, 'green');

        }
        else if (operation == 'magnitude'){
            console.log("Magnitude v1: " + v1.magnitude());
            console.log("Magnitude v2: " + v2.magnitude());
        }
        else if (operation == 'normalize'){
            v3 = v1.normalize();
            v4 = v2.normalize();

            drawVector(v3, 'green');
            drawVector(v4, 'green');

        }
        else if (operation == 'dot'){
            var dp, m1, m2;
            m1 = v1.magnitude();
            m2 = v2.magnitude();
            dp = Vector3.dot(v1, v2);
            
            if (m1 == 0 || m2 == 0){
                console.log("Angle undefined due to zero vector.");
            }
            else {
                let angle = Math.acos(dp / (m1 * m2)) * (180 / Math.PI);
                console.log("Angle: " + angle);
            }

        }
        else if (operation == 'cross'){
            let cross = Vector3.cross(v1, v2);
            let area = cross.magnitude() / 2;
            console.log("Area of triangle: " + area);
                
        }


    };

}


function drawVector(v, color){
    var canvas = document.getElementById('cnvs'); 
    var ctx = canvas.getContext('2d');

    var x, y;
    x = v.elements[0] * 20;
    y = (v.elements[1] * 20) * -1; //Canvas needs to follow math rules, so I flip the y value for canvas usage

    let center = [canvas.width/2, canvas.height/2];


    //Instructions
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(center[0], center[1]);
    ctx.lineTo(center[0] + x, center[1] + y);
    ctx.stroke();
    
}

