export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(error=>{
            return next(new Error(error, {cause:500}))
            // return res.status(500).json({error, message:error.message, error:error.name, stack:error.stack })
        })
    }
};


export const globalErrorHandling = (error, req, res, next)=>{
    return res.status(error.cause || 400).json({error, message:error.message, error:error.name, stack:error.stack })
}