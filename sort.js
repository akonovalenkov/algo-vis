function heapsort(arr) {
    const heapSize = arr.length;
    for (let i = heapSize/2; i >= 0; i--) {
        sink(arr, i, heapSize);
    }

    for (let i = heapSize - 1; i > 0; i--) {
        swap(arr, 0, i);
        sink(arr, 0, i);
    }
}

function sink(arr, i, heapSize) {
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
        sink(arr, largest, heapSize);
    }
}

function countingSort(arr) {
    let max = 0;
    for (let el of arr) {
        max = Math.max(max, el);
    }

    const count = new Array(max+1).fill(0);
    for (let el of arr) {
        count[el]++;
    }

    for (let i = 1; i < count.length; i++) {
        count[i] += count[i-1];
    }

    const buffer = new Array(arr.length);


    for (let i = arr.length; i > 0; i--) {
        buffer[count[arr[i-1]]-1] = arr[i-1];
        count[arr[i-1]]--;
    }

    for (var i = 0, len = arr.length; i < len; i++) {
        arr[i] = buffer[i];
    }

    return arr;
}



function* bottomUpMergeSortGen(arr) {
    let mergeGroup = 2;

    while (mergeGroup <= arr.length) {
        let left = 0;
        const subCount = mergeGroup >> 1;
        let right = subCount;

        while (right < arr.length) {
            const rightEnd = Math.min(right + subCount, arr.length);
            yield *merge(arr, left, right, rightEnd);
            left = right + subCount;
            right = left + subCount;
        }

        mergeGroup <<= 1;
    }

    mergeGroup >>= 1;
    if (mergeGroup < arr.length) {
        yield* merge(arr, 0, mergeGroup, arr.length);
    }
}



function* mergerSortGen(arr) {
    yield* mergeSortGenInternal(arr, 0, arr.length);
}

function* mergeSortGenInternal(arr, from, to) {
    if (to-from < 2) return;

    const mid = from + Math.floor((to - from) / 2);

    yield* mergeSortGenInternal(arr, from, mid);
    yield* mergeSortGenInternal(arr, mid, to);

    yield* merge(arr, from, mid, to);
}

function* merge(arr, from, mid, to) {
    const tempArr = new Array(to-from);
    let left = from;
    let right = mid;

    let i = 0;
    while (left < mid && right < to) {
        if (arr[left] < arr[right]) {
            tempArr[i++] = arr[left++];
        } else {
            tempArr[i++] = arr[right++];
        }
        yield;
    }

    while (left < mid) {
        tempArr[i++] = arr[left++];
        yield;
    }
    while (right < to) {
        tempArr[i++] = arr[right++];
        yield;
    }
        
    for (let j = from, k = 0; j < to; j++, k++) {
        arr[j] = tempArr[k];
        yield;
    }
}

function* quickSortGen(arr) {
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
        yield;
    }
    yield* quickSortGenInternal(arr, smallerFrom, eqFrom);
    yield* quickSortGenInternal(arr, largerFrom, to);
}

function* bubbleSortGen(arr) {
    let swapped = true;
    let n = arr.length;
    while (swapped) {
        swapped = false;
        for (var i = 1; i < n; i++) {
            if (arr[i] < arr[i-1]) {
                swap(arr, i, i - 1);
                swapped = true;
            }
            yield;
        }
        n--;
    }
}

function* insertionSortGen(arr) {
    for (var i = 1, len = arr.length; i < len; i++) {
        let j = i;
        while (j > 0 && arr[j] < arr[j-1]) {
            swap(arr, j, j - 1);
            j--;
            yield;
        }
        yield;
    }
}



function* selectionSortGen(arr) {
    for (var i = 0, len = arr.length; i < len; i++) {

        let minIdx = i;
        for (var j = i + 1; j < len; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
            yield;
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
        //const barHeight = (el - minAndMax.min) / dist * ctx.canvas.height * 0.9;
        const barHeight = el/arr.length * ctx.canvas.height;
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
    const {canvasId, arrSize, sortGen, speed} = config;
    const arr = new Array(arrSize).fill(42).map((v, i) => i+1);
    //const arr = new Array(arrSize).fill(42);//.map((v, i) => i+1);
    //const arr = new Array(arrSize).fill(42).map((v, i) => i % 2 == 0 ? 50: 100);
    //const arr = new Array(arrSize).fill(42).map((v, i) => i+1);
    //arr.reverse();
    //shuffle(arr);
    runVis(canvasId, arr, sortGen, speed);
}


function runVis(canvasId, arr, algoGen, speed) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    const visIter = visGen(ctx, arr, algoGen);
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

function* visGen(ctx, arr, algoGen) {
    const algoIter = algoGen(arr);

    do {
        draw(ctx, arr);
        yield;
    } while (!algoIter.next().done);

    draw(ctx, arr, 'yellow');
}

const arrSize = 1000;
const speed = 10;

runRandomArrVis({
    canvasId: 'insertion-sort-canvas',
    arrSize: arrSize,
    sortGen: insertionSortGen,
    speed: speed
});

runRandomArrVis({
    canvasId: 'selection-sort-canvas',
    arrSize: arrSize,
    sortGen: selectionSortGen,
    speed: speed
});

runRandomArrVis({
    canvasId: 'bubble-sort-canvas',
    arrSize: arrSize,
    sortGen: bubbleSortGen,
    speed: speed
});

runRandomArrVis({
    canvasId: 'qs-canvas',
    arrSize: arrSize,
    sortGen: quickSortGen,
    speed: speed
});

runRandomArrVis({
    canvasId: 'merge-sort-canvas',
    arrSize: arrSize,
    sortGen: mergerSortGen,
    speed: speed
});

runRandomArrVis({
    canvasId: 'bu-merge-sort-canvas',
    arrSize: arrSize,
    sortGen: bottomUpMergeSortGen,
    speed: speed
});


