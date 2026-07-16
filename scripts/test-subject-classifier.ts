import { evaluateSubject } from "../lib/knowledge/engine/evaluateSubject"

const products = [
  "Golden English Language Textbook Book 4",
  "Best Brain Mathematics Workbook Book 5",
  "Golden Integrated Science Textbook",
  "Creative Arts Learner Book",
  "Religious & Moral Education Book 3",
  "French Activity Book"
]

for (const product of products) {
  console.log("================================")
  console.log(product)
  console.log(evaluateSubject(product))
}