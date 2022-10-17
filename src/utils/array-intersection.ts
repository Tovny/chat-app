export const arrayIntersection = (
    arr1: any[],
    arr2: any[],
    keys?: string | string[]
) => {
    const intersects = arr1.find((item1) => {
        return arr2.find((item2) => {
            if (!keys) {
                return item1 === item2;
            }
            if (typeof keys === 'string') {
                return item1[keys] === item2[keys];
            }
            const value1 = reduceKeys(keys, item1);
            const value2 = reduceKeys(keys, item2);

            return value1 === value2;
        });
    });
    return intersects;
};

const reduceKeys = (keys: string[], item: Record<string, any>) => {
    return keys.reduce((prev, curr) => {
        return prev[curr];
    }, item);
};
