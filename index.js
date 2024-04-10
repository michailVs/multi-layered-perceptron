// Многослойный персептрон Румельхарта

const X=2, N= [ 5, 3, 1 ], Xn = 20, Yn = 10, P = 2, left = 0, right = 1
let L = N.length,  w = [], S = [], out = [], Ts = [], Err = [ ['Itteration', 'Error'] ], iteration = 0

function rnd(min, max) {
    return (min + Math.random() * (max - min))
}

function init() {
    w = []
    N.forEach((value, index) => {
        w.push([])
        for (let i = 0; i < value; i++) {
            w[index].push([])
            let n = index > 0 ? N[index - 1] : X
            for (let j = 0; j < n; j++) {
                w[index][i].push(rnd(-0.5, 0.5))
            }
        }
    })
    // console.log(w)
}

function neuron(x, debug = 0) {
    S = []
    out = []
    N.forEach((layer, l) => {
        if (debug) {
            // console.log('N', l > 0 ? out[l - 1] : x, w[l])
        }
        S.push([])
        out.push([])
        S[l] = Array(layer).fill(0)
        out[l] = Array(layer).fill(0)
        w[l].forEach((k, j) => {
            (l > 0 ? out[l - 1] : x).forEach((value, i) => {
                S[l][j] += value * w[l][j][i]
                if (debug) {
                    // console.log('l', S[l][j], out[l - 1] ?? value, w[l][j][i] )
                }
            })
            out[l][j] = 1 / (1 + Math.exp( -0.3 * S[l][j] ))
            if (debug) {
                // console.log('w', out[l][j])
            }
        })
    })
    if (debug) {
        // console.log('output', out, x)
    }
    return out[L-1][0]
}

function createArr(x, y) {
    let num = 0
    for (let i = 1; i <= x; i++) {
        for (let j = 1; j <= y; j++) {
            Ts.push([])
            Ts[num].push(i, j, i <= (Xn / P) ? left: right)
            num++
        }
    }
}

const canvas = document.querySelector('.canvas')
const ctx = canvas.getContext('2d')
const refresh = document.querySelector('.refresh')
const text = document.querySelector('.text')
const trianBtn = document.querySelector('.train')
const trainNum = document.querySelector('.train_num')
const quality = document.querySelector('.quality')

function train(EPOCH, n = 0.1) {
    let err = []
    for (let epoch = 0; epoch < EPOCH; epoch++) {
        Ts.forEach((example, index) => {
            err = []
            let value = Ts[Math.round(rnd(0, 199))]
            N.forEach((value, i) => err.push([]))
            for (let l = (L - 1); l >= 0 ; l--) {
                for (let k = 0; k < N[l]; k++) {
                    let y = neuron(value.slice(0, 2))
                    if (l === L - 1) {
                        err[l].push((y - value[2]) * (y * (1 - y)))
                    } else {
                        let summErr = 0
                        err[l + 1].forEach((error, Neuron) => {
                            summErr += error * w[l + 1][Neuron][k]
                        })
                        err[l].push(summErr * (y * (1 - y)))
                    }
                }
            }
            out.forEach((layer, l) => {
                w[l].forEach((k, j) => {
                    k.forEach((weight, i) => {
                        let fp = out[l][j] * (1 - out[l][j])
                        w[l][j][i] += -n * fp * err[l][j] * (l === 0 ? value[i] : out[l - 1][i])
                    })
                })
            })
        })
    }
    drawMask()
    Err.push([iteration, E()])
    iteration++
}

function E() {
    let s = 0
    Ts.forEach((value, index) => {
        s += (neuron(value.slice(0, 2)) - value[2])**2
    })
    return 1/ Ts.length * s
}

const C = [
    'blue',    // True Left
    'green',    // False Left
    'red',    // True Right
    'yellow'   // False right
]

function answer(o, x, y) {
    if (o <= 0.5) {
        condition(o, C[0], C[1], x, y)
        return 'Left side'
    } else {
        condition(o, C[2], C[3], x, y)
        return 'Right side'
    }
}



canvas.width = Xn * 30
canvas.height = Yn * 30

function drawMask() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'black'
    ctx.lineWidth = 1
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
            ctx.rect(i * 25 + 55, j * 25 + 25, 20, 20)
        }
    }
    ctx.stroke()
}
drawMask()

function condition(out, color1, color2, x, y) {
    out = +out.toFixed(1)
    if (x <= 10) {
        if (out <= 0.5) {
            ctx.fillStyle = color1
        } else {
            ctx.fillStyle = color2
        }
    } else {
        if (out > 0.5) {
            ctx.fillStyle = color1
        } else {
            ctx.fillStyle = color2
        }
    }
    ctx.fillRect((x === 20 ? 19 : x === 0 ? x : x - 1) * 25 + 55, (y === 10 ? 9 : y === 0 ? y : y - 1) * 25 + 25, 20, 20)
}

document.addEventListener('DOMContentLoaded', () => {
    init()
    createArr(Xn, Yn)
    ctx.font = '12px serif'
    ctx.fillStyle = 'black'
    ctx.fillText('Itteration: N, Error: N, acc: N', 5, canvas.height - 10)
})

function generator() {
    drawMask()
    const xPos = Math.floor(Math.random() * 20)
    const yPos = Math.floor(Math.random() * 10)

    text.innerText = `X position: ${xPos}, Y position: ${yPos}`

    const data = answer(neuron([xPos, yPos], 1), xPos, yPos)

    // const textSide = xPos <= 10 ? 'Left side': 'Right side'
    
    ctx.font = '16px serif'
    ctx.fillText(data, canvas.width / 2.2, canvas.height - 10)
    ctx.font = '16px serif'
    ctx.fillStyle = 'black'
    ctx.lineWidth = .3
    ctx.strokeText(data, canvas.width / 2.2, canvas.height - 10)
    ctx.font = '12px serif'
    let acc = 1 - (+Err[Err.length - 1][1].toFixed(2))
    let err = +Err[Err.length - 1][1].toFixed(2).split('.')[1]
    acc = +acc.toFixed(2).split('.')[1]
    ctx.fillText(`Itteration: ${Err[Err.length - 1][0]}, Error: ${err}%, acc: ${acc}%`, 5, canvas.height - 10)
}

refresh.addEventListener('click', generator)
trianBtn.addEventListener('click', () => {
    drawMask()
    if (!+trainNum.value) {
        trianBtn.innerText = `train x1000`
        if (!+quality.value) {
            train(1000)
        } else {
            train(1000, +quality.value)
        }
    } else {
        trianBtn.innerText = `train x${+trainNum.value}`
        if (!+quality.value) {
            train(+trainNum.value)
        } else {
            train(+trainNum.value, +quality.value)
        }
    }
    let acc = 1 - (+Err[Err.length - 1][1].toFixed(2))
    let err = +Err[Err.length - 1][1].toFixed(2).split('.')[1]
    acc = +acc.toFixed(2).split('.')[1]
    console.log()
    ctx.font = '12px serif'
    ctx.fillStyle = 'black'
    ctx.fillText(`Itteration: ${Err[Err.length - 1][0]}, Error: ${err}%, acc: ${acc}%`, 5, canvas.height - 10)
})