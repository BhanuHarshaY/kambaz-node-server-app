export default function PathParameters(app) {
 const add = (req, res) => {
   const { a, b } = req.params;
   const sum = parseInt(a) + parseInt(b);
   res.send(sum.toString());
 };
 const substract = (req, res) => {
   const { a, b } = req.params;
   const sum = parseInt(a) - parseInt(b);
   res.send(sum.toString());
 };
 const multiply = (req, res) => {
   const { a, b } = req.params;
   const product = parseInt(a) * parseInt(b);
   res.send(product.toString());
 };
 const divide = (req, res) => {
   const { a, b } = req.params;
   const quotient = parseInt(a) / parseInt(b);
   res.send(quotient.toString());
 };
 app.get("/lab5/add/:a/:b", add);
 app.get("/lab5/subtract/:a/:b", substract);
 app.get("/lab5/multiply/:a/:b", multiply);
 app.get("/lab5/divide/:a/:b", divide);

};
