export const arraysIntersect = (
    arr1: any[],
    arr2: any[],
    keys?: string | string[]
) => {
    for (let item of arr1) {
        let intersects = false;
        if (keys) {
            if (typeof keys === 'object') {
                item = keys.reduce((_, curr) => item[curr]);
                intersects = arr2.some((i) => {
                    i = keys.reduce((_, curr) => i[curr]);
                    return i === item;
                });
            } else {
                intersects = arr2.some((i) => i[keys] === item[keys]);
            }
        } else {
            intersects = arr2.some((i) => i === item);
        }

        if (intersects) {
            return intersects;
        }
    }
    return false;
};
