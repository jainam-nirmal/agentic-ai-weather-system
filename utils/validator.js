class Validator {
    static validCity(cityName) {
        if (!cityName) {
            throw new Error("City name is required");
        }
        if (typeof cityName !== "string") {
            throw new Error("City name must be a string");
        }
        if (cityName.trim() === "") {
            throw new Error("City name cannot be empty");
        }
        if (cityName.length < 2) {
            throw new Error("City name must be at least 2 characters long");
        }
        return true;
    }
}

export default Validator;
