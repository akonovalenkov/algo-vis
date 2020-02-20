
function* countingSortGen(arr, mapper, max) {
    yield { arr, count: [], buffer: [] };
    if (arr.length < 2) {
        return;
    }

    if (max === undefined) {
        let isSorted = true;
        let prevEl = mapper ? mapper(arr[0]) : arr[0];
        max = prevEl;
        for (var i = 1, len = arr.length; i < len; i++) {
            let el = mapper ? mapper(arr[i]) : arr[i];
            max = Math.max(max, el);
            if (el < prevEl) {
                isSorted = false;
            }
            prevEl = el;
            yield { arr, count: [max], buffer: [] };
        }

        if (isSorted) {
            return;
        }
    }

    const count = new Array(max+1);
    count[0] = 0;
    for (let el of arr) {
        const countEl = mapper ? mapper(el) : el;
        if (count[countEl]) {
            count[countEl]++;
        } else {
            count[countEl] = 1;
        }
        yield { arr, count, buffer: []};
    }

    for (let i = 1; i < count.length; i++) {
        count[i] = (count[i] || 0) + (count[i-1] || 0);
        yield { arr, count, buffer: [] };
    }

    const buffer = new Array(arr.length);

    for (let i = arr.length; i > 0; i--) {
        let el = mapper ? mapper(arr[i-1]) : arr[i-1];
        buffer[count[el]-1] = arr[i-1];
        count[el]--;
        yield { arr, count, buffer };
    }

    for (var i = 0, len = arr.length; i < len; i++) {
        arr[i] = buffer[i];
        yield { arr, count, buffer };
    }
}


function* radixSortGen(arr, r) {
    yield { arr, count: [], buffer: [] };
    r = r || 8;
    let mask = (1<<r) - 1;

    let max = 0;

    for (let el of arr) {
        max = Math.max(max, el);
        yield { arr, count: [max], buffer: [] };
    }

    if (max < mask) {
        r = Math.ceil(Math.log2(max));
        mask = (1<<r) - 1;
    }

    let runs = 0;
    while (max) {
        let stateIter = countingSortGen(arr, x => (x >> (r*runs)) & mask, mask);
        let state = stateIter.next();

        while (!state.done) {
            yield state.value;
            state = stateIter.next();
        }
        max >>= r;
        runs++;
    }
}

function* heapsortGen(arr) {
    yield { arr };
    const heapSize = arr.length;
    for (let i = heapSize/2; i >= 0; i--) {
        yield* sink(arr, i, heapSize);
    }

    for (let i = heapSize - 1; i > 0; i--) {
        swap(arr, 0, i);
        yield { arr };
        yield* sink(arr, 0, i);
    }
}

function* sink(arr, i, heapSize) {
    let largest = i;
    const l = i*2 + 1;
    const r = l + 1;

    if (l < heapSize && arr[l] > arr[largest]) {
        largest = l;
    }

    if (r < heapSize && arr[r] > arr[largest]) {
        largest = r;
    }

    if (largest != i) {
        swap(arr, i, largest);
        yield { arr };
        yield* sink(arr, largest, heapSize);
    }
    yield { arr };
}


function* bottomUpMergeSortGen(arr) {
    const auxArr = new Array(arr.length).fill(0);
    yield { arr, auxArr };

    let mergeGroup = 2;

    while (mergeGroup <= arr.length) {
        let left = 0;
        const subCount = mergeGroup >> 1;
        let right = subCount;

        while (right < arr.length) {
            const rightEnd = Math.min(right + subCount, arr.length);
            yield *merge(arr, left, right, rightEnd, auxArr);
            left = right + subCount;
            right = left + subCount;
        }

        mergeGroup <<= 1;
    }

    mergeGroup >>= 1;
    if (mergeGroup < arr.length) {
        yield* merge(arr, 0, mergeGroup, arr.length, auxArr);
    }
}



function* mergerSortGen(arr) {
    const auxArr = new Array(arr.length).fill(0);
    yield { arr, auxArr };
    yield* mergeSortGenInternal(arr, 0, arr.length, auxArr);
}

function* mergeSortGenInternal(arr, from, to, auxArr) {
    if (to-from < 2) return;

    const mid = from + Math.floor((to - from) / 2);

    yield* mergeSortGenInternal(arr, from, mid, auxArr);
    yield* mergeSortGenInternal(arr, mid, to, auxArr);

    yield* merge(arr, from, mid, to, auxArr);
}

function* merge(arr, from, mid, to, auxArr) {
    let left = from;
    let right = mid;

    let i = 0;
    while (left < mid && right < to) {
        if (arr[left] < arr[right]) {
            auxArr[i++] = arr[left++];
        } else {
            auxArr[i++] = arr[right++];
        }
        yield { arr, auxArr };
    }

    while (left < mid) {
        auxArr[i++] = arr[left++];
        yield { arr, auxArr };
    }
    while (right < to) {
        auxArr[i++] = arr[right++];
        yield { arr, auxArr };
    }
        
    for (let j = from, k = 0; j < to; j++, k++) {
        arr[j] = auxArr[k];
        yield { arr, auxArr };
    }
}

function* quickSortGen(arr) {
    yield { arr };
    yield* quickSortGenInternal(arr, 0, arr.length);
}

function* quickSortGenInternal(arr, from, to) {
    if (from >= to) return;
    let largerFrom = to;
    let smallerFrom = from;
    let eqFrom = from;
    let nonVisited = from + 1;
    let randomElIdx = getRandomInt(from, to);
    swap(arr, from, randomElIdx);
    yield { arr };
    while (nonVisited < largerFrom) {
        if (arr[nonVisited] < arr[eqFrom]) {
            swap(arr, nonVisited, eqFrom);
            nonVisited++;
            eqFrom++;
        } else if (arr[nonVisited] > arr[eqFrom]) {
            largerFrom--;
            swap(arr, nonVisited, largerFrom);
        } else {
            nonVisited++;
        }
        yield { arr };
    }
    yield* quickSortGenInternal(arr, smallerFrom, eqFrom);
    yield* quickSortGenInternal(arr, largerFrom, to);
}

function* bubbleSortGen(arr) {
    yield { arr };
    let swapped = true;
    let n = arr.length;
    while (swapped) {
        swapped = false;
        for (var i = 1; i < n; i++) {
            if (arr[i] < arr[i-1]) {
                swap(arr, i, i - 1);
                swapped = true;
            }
            yield { arr };
        }
        n--;
    }
}

function* insertionSortGen(arr) {
    yield { arr };
    for (var i = 1, len = arr.length; i < len; i++) {
        let j = i;
        while (j > 0 && arr[j] < arr[j-1]) {
            swap(arr, j, j - 1);
            j--;
            yield { arr };
        }
        //yield { arr };
    }
}



function* selectionSortGen(arr) {
    yield { arr };
    for (var i = 0, len = arr.length; i < len; i++) {

        let minIdx = i;
        for (var j = i + 1; j < len; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
            yield { arr };
        }

        swap(arr, i, minIdx);
    }
}

function getMinIdx(arr, startFrom) {
    let minIdx = startFrom;
    for (var i = startFrom + 1, len = arr.length; i < len; i++) {
        if (arr[i] < arr[minIdx]) {
            minIdx = i;
        }
    }
    return minIdx;
}

function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function minmax(arr) {
    return arr.reduce((result, el) => {
        result.min = Math.min(result.min, el);
        result.max = Math.max(result.max, el);
        return result;
    }, {
        min: arr[0],
        max: arr[0]
    });
}

function draw(ctx, arr, bg = 'white') {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';
    const minAndMax = minmax(arr)
    const dist = minAndMax.max - minAndMax.min;
    const barGutter = 1;
    const barWidth = (ctx.canvas.width - (arr.length - 1)*barGutter) / arr.length;

    ctx.fillStyle = 'black';
    let barsCount = 0;
    for (let el of arr) {
        const barHeight = (el || 0)/arr.length * ctx.canvas.height;
        const xPos = barsCount * barWidth + barsCount * barGutter;
        ctx.fillRect(xPos, 0, barWidth, barHeight);
        barsCount++;
    }
}

function sorted(arr) {
    let prev = arr[0];
    for (let el of arr) {
        if (el < prev) {
            return false;
        }
        prev = el;
    }
    return true;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function* shuffleSortGen(arr) {
    while (!sorted(arr)) {
        let j, i;
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            swap(arr, i, j);
            yield;
        }
    }
}

function runRandomArrVis(config) {
    const {contexts, arrSize, sortGen, speed} = config;
    const arr = new Array(arrSize).fill(42).map(_ => getRandomInt(0, arrSize + 1));
    //const arr = new Array(arrSize).fill(42);//.map((v, i) => i+1);
    //const arr = new Array(arrSize).fill(42).map((v, i) => i % 2 == 0 ? 50: 100);
    //const arr = new Array(arrSize).fill(42).map((v, i) => i+1);
    //arr.reverse();
    //shuffle(arr);
    runVis(contexts, arr, sortGen, speed);
}

function getContext(canvasId) {
    return document.getElementById(canvasId)
        .getContext('2d');
}


function runVis(contexts, arr, algoGen, speed) {
    if (!contexts) return;
    for (let ctx of Object.values(contexts)) {
        ctx.translate(0, ctx.canvas.height);
        ctx.scale(1, -1);
    }

    const visIter = visGen(contexts, arr, algoGen);
    visIter.next();
    setTimeout(visStep, speed, visIter, speed);
}

function visStep(visIter, speed) {
    if (visIter.next().done) {
        return;
    } else {
        setTimeout(visStep, speed, visIter, speed);
    }
}

function* visGen(contexts, arr, algoGen) {
    const algoIter = algoGen(arr);

    let state = algoIter.next();
    let lastState = state;

    while (!state.done) {
        lastState = state;
        drawState(state.value, contexts);
        yield;
        state = algoIter.next();
    }

    drawState(lastState.value, contexts, 'yellow');
}

function drawState(state, contexts, bg) {
    for (let k in state) {
        draw(contexts[k], state[k], bg);
    }
}

const arrSize = 100;
const speed = 10;

runRandomArrVis({
    contexts: {
        arr: getContext('insertion-sort-canvas'),
    },
    arrSize: arrSize,
    sortGen: insertionSortGen,
    speed: speed
});

runRandomArrVis({
    contexts: {
        arr: getContext('selection-sort-canvas'),
    },
    arrSize: arrSize,
    sortGen: selectionSortGen,
    speed: speed
});

runRandomArrVis({
    contexts: {
        arr: getContext('bubble-sort-canvas'),
    },
    arrSize: arrSize,
    sortGen: bubbleSortGen,
    speed: speed
});

runRandomArrVis({
    contexts: {
        arr: getContext('qs-canvas'),
    },
    arrSize: arrSize,
    sortGen: quickSortGen,
    speed: speed
});

runRandomArrVis({
    contexts: {
        arr: getContext('bu-merge-sort-arr-canvas'),
        auxArr: getContext('bu-merge-sort-aux-canvas'),
    },
    arrSize: arrSize,
    sortGen: bottomUpMergeSortGen,
    speed: speed
});

runRandomArrVis({
    contexts: {
        arr: getContext('counting-sort-arr-canvas'),
        count: getContext('counting-sort-count-canvas'),
        buffer: getContext('counting-sort-buffer-canvas')
    },
    arrSize: arrSize,
    sortGen: countingSortGen,
    speed: speed
});

runRandomArrVis({
    contexts: {
        arr: getContext('radix-sort-arr-canvas'),
        count: getContext('radix-sort-count-canvas'),
        buffer: getContext('radix-sort-buffer-canvas')
    },
    arrSize: arrSize,
    sortGen: radixSortGen,
    speed: speed
});

runRandomArrVis({
    contexts: {
        arr: getContext('merge-sort-arr-canvas'),
        auxArr: getContext('merge-sort-aux-canvas'),
    },
    arrSize: arrSize,
    sortGen: mergerSortGen,
    speed: speed
});

runRandomArrVis({
    contexts: {
        arr: getContext('heap-sort-canvas'),
    },
    arrSize: arrSize,
    sortGen: heapsortGen,
    speed: speed
});
