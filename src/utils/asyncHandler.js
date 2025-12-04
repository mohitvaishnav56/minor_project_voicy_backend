
const asyncHandlerHandler = (func) => {
    (req, res, next) => {
        Promise.resolve(func(req, res, next))
        .reject((error) => next(error));
    }
}



export {asyncHandler};