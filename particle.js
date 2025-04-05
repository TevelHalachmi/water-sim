class Particle{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.r = radius;
        this.mass = Math.PI * this.r * this.r;

        this.color = color;

        this.velx = 0;
        this.vely = 0;

        this.accx = 0;
        this.accy = 0;
    }

    addForce(x, y){
        this.accx += x;
        this.accy += y;
    }

    update(dt){
        this.velx += this.accx * dt;
        this.vely += this.accy * dt;

        this.x += this.velx * dt;
        this.y += this.vely * dt;

        this.accx = 0;
        this.accy = 0;
    }

    borderCollisions(width, height, restitution){
        const hw = width / 2;
        const hh = height / 2;

        if (this.x + this.r > hw){
            this.x = hw - this.r;
            this.velx *= -restitution;
        }
        else if (this.x - this.r < -hw){
            this.x = -hw + this.r;
            this.velx *= -restitution;
        }

        if (this.y + this.r > hh){
            this.y = hh - this.r;
            this.vely *= -restitution;
        }
        else if (this.y - this.r < -hh){
            this.y = -hh + this.r;
            this.vely *= -restitution;
        }
    }

    collideOther(other, restitution){
        const diffx = this.x - other.x;
        const diffy = this.y - other.y;
        const distanceSquared = diffx * diffx + diffy * diffy;
        const radii = this.r + other.r;
    
        if (distanceSquared >= radii * radii){
            return; 
        }
    
        const distance = Math.sqrt(distanceSquared) || 0.01;
        const overlap = radii - distance;
    
        const nx = diffx / distance;
        const ny = diffy / distance;
        
        const totalMass = this.mass + other.mass;

        // Correct positions (push particles apart equally)
        const correction = overlap / totalMass;
        this.x += nx * correction * other.mass;
        this.y += ny * correction * other.mass;
    
        other.x -= nx * correction * this.mass;
        other.y -= ny * correction * this.mass;
    
        // Correct velocities to reflect realistic collision
        const relativeVelx = this.velx - other.velx;
        const relativeVely = this.vely - other.vely;
    
        const dot = relativeVelx * nx + relativeVely * ny;
    
        // Only resolve if particles are moving towards each other
        if (dot > 0) {
          return;
        }
        
        const impulse = (-(1 + restitution) * dot) / (1 / this.mass + 1 / other.mass);

        this.velx += (impulse / this.mass) * nx;
        this.vely += (impulse / this.mass) * ny;
    
        other.velx -= (impulse / other.mass) * nx;
        other.vely -= (impulse / other.mass) * ny;
    }    

    draw(ctx, width, height){
        ctx.beginPath();
        ctx.arc(width / 2 + this.x, height / 2 - this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}