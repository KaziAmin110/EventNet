const errorMiddleware = (err, req, res, next) => {
    try { 
        let error = { ...err};

        error.message = err.message;

        if (error.message == "User Already Exists") {
            res.status(409).json({
                success: false,
                error: error.message
            })
        }
    } catch (error) {
        next(error);
    }
}

export default errorMiddleware;
