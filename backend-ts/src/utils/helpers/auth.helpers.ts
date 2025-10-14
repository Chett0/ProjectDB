

const generateRandomPassword = async(length : number = 12) : Promise<string> => {
    try{
        const upperChars : string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowerChars : string = "abcdefghijklmnopqrstuvwxyz";
        const numberChars : string = "0123456789";
        const symbolChars : string = "!@#$%^&*()-_=+[]{}|;:,.<>?/";

        const allChars : string = upperChars + lowerChars + numberChars + symbolChars;

        let password = "";
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += allChars[array[i]! % allChars.length];
        }

        return password;

    } catch(err){
        throw new Error(
            `Failed to generate random password: ${err instanceof Error ? err.message : "Unknown error"}`
        )
    };
};

export {
    generateRandomPassword
}