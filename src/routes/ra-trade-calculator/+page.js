import { getRaPickValues } from '$lib/utils/helperFunctions/raPickValues';

export async function load({ fetch }) {
    const valueData = getRaPickValues(fetch);
    return {
        valueData
    };
}