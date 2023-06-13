export const isJsonString = (str) => {
    try {
        const strObj = JSON.parse(str);
        if(strObj && typeof strObj === 'object'){
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
};