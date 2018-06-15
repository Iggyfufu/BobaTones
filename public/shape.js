window.onload = function() {
  const canvas = this.document.getElementById('myCanvas')
  paper.setup(canvas)

  function Ball(r, p, v) {
    this.radius = r
    this.point = p
    this.vector = v
    this.maxVec = 5
    this.numSegment = Math.floor(r / 3 + 2)
    this.boundOffset = []
    this.boundOffsetBuff = []
    this.sidePoints = []
    this.path = new paper.Path({
      fillColor: {
        hue: Math.random() * 360,
        saturation: 1,
        brightness: 0
      },
      blendMode: 'lighter'
    })

    for (let i = 0; i < this.numSegment; i++) {
      this.boundOffset.push(this.radius)
      this.boundOffsetBuff.push(this.radius)
      this.path.add(new paper.Point())
      this.sidePoints.push(
        new paper.Point({
          angle: 360 / this.numSegment * i,
          length: 1
        })
      )
    }
  }

  Ball.prototype = {
    iterate() {
      this.checkBorders()
      if (this.vector.length > this.maxVec) {
        this.vector.length = this.maxVec
      }
      this.point = this.point.add(this.vector)
      this.updateShape()
    },

    checkBorders() {
      const size = paper.view.size
      if (this.point.x < -this.radius) {
        this.point.x = size.width + this.radius
      }
      if (this.point.x > size.width + this.radius) {
        this.point.x = -this.radius
      }
      if (this.point.y < -this.radius) {
        this.point.y = size.height + this.radius
      }
      if (this.point.y > size.height + this.radius) {
        this.point.y = -this.radius
      }
    },

    updateShape() {
      const segments = this.path.segments
      for (var i = 0; i < this.numSegment; i++) {
        segments[i].point = this.getSidePoint(i)
      }

      this.path.smooth()
      for (var i = 0; i < this.numSegment; i++) {
        if (this.boundOffset[i] < this.radius / 4) {
          this.boundOffset[i] = this.radius / 4
        }
        const next = (i + 1) % this.numSegment
        const prev = i > 0 ? i - 1 : this.numSegment - 1
        let offset = this.boundOffset[i]
        offset += (this.radius - offset) / 15
        offset +=
          ((this.boundOffset[next] + this.boundOffset[prev]) / 2 - offset) / 3
        this.boundOffsetBuff[i] = this.boundOffset[i] = offset
      }
    },

    react(b) {
      const dist = this.point.getDistance(b.point)
      if (dist < this.radius + b.radius && dist != 0) {
        const overlap = this.radius + b.radius - dist
        const direc = this.point.subtract(b.point).normalize(overlap * 0.015)
        this.vector = this.vector.add(direc)
        b.vector = b.vector.subtract(direc)

        this.calcBounds(b)
        b.calcBounds(this)
        this.updateBounds()
        b.updateBounds()
      }
    },

    getBoundOffset(b) {
      const diff = this.point.subtract(b)
      const angle = (diff.angle + 180) % 360
      return this.boundOffset[Math.floor(angle / 360 * this.boundOffset.length)]
    },

    calcBounds(b) {
      for (let i = 0; i < this.numSegment; i++) {
        const tp = this.getSidePoint(i)
        const bLen = b.getBoundOffset(tp)
        const td = tp.getDistance(b.point)
        if (td < bLen) {
          this.boundOffsetBuff[i] -= (bLen - td) / 2
        }
      }
    },

    getSidePoint(index) {
      const mult = this.sidePoints[index].multiply(this.boundOffset[index])
      return this.point.add(mult)
    },

    updateBounds() {
      for (let i = 0; i < this.numSegment; i++) {
        this.boundOffset[i] = this.boundOffsetBuff[i]
      }
    }
  }

  const balls = []
  const numBalls = 10
  for (let i = 0; i < numBalls; i++) {
    const position = paper.Point.random().multiply(paper.view.size)
    const vector = new paper.Point({
      angle: Math.floor(360 * Math.random()),
      length: Math.floor(Math.random() * 10)
    })
    const radius = Math.random() * 60 + 60
    balls.push(new Ball(radius, position, vector))
  }

  paper.view.onFrame = function() {
    for (var i = 0; i < balls.length - 1; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        balls[i].react(balls[j])
      }
    }
    for (var i = 0, l = balls.length; i < l; i++) {
      balls[i].iterate()
    }
  }
}