class Camera{
    constructor(){
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
    }

    forward() {
        var f = new Vector3(this.at.elements)
        f.sub(this.eye);
        f.div(f.magnitude());
        this.at = new Vector3(this.at.elements);
        this.eye = new Vector3(this.eye.elements);
        this.at.add(f);
        this.eye.add(f);
    }

    back(){
        var f = new Vector3(this.at.elements)
        f.sub(this.eye);
        f.div(f.magnitude());
        this.at = new Vector3(this.at.elements)
        this.eye = new Vector3(this.eye.elements);
        this.at.sub(f);
        this.eye.sub(f);
    }
    right(){
        var f = new Vector3(this.at.elements)
        f.sub(this.eye);
        f.div(f.magnitude());
        var r = Vector3.cross(f, this.up);
        r.div(r.magnitude());
        this.at = new Vector3(this.at.elements)
        this.eye = new Vector3(this.eye.elements);
        this.at.add(r);
        this.eye.add(r);
    }
    left(){
        var f = new Vector3(this.at.elements)
        f.sub(this.eye);
        f.div(f.magnitude());
        var r = Vector3.cross(f, this.up);
        r.div(r.magnitude());
        this.at = new Vector3(this.at.elements)
        this.eye = new Vector3(this.eye.elements);
        this.at.sub(r);
        this.eye.sub(r);
    }

    pan(angle, axis){
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);

        var rotMat = new Matrix4();
        rotMat.setRotate(angle, axis.elements[0], axis.elements[1], axis.elements[2]);

        var f_prime = rotMat.multiplyVector3(f);

        this.at = new Vector3(this.eye.elements);
        this.at.add(f_prime);
    }
}