export type BookCategory = "Fiction" | "Science" | "History" | "Kids" | "Others";

export type Book = {
  _id: string;
  title: string;
  author: string;
  category: BookCategory;
  image: string;
  description: string;
  totalCopies: number;
  addedBy: {
    name: string;
    email: string;
  };
  addedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Borrow = {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
  returned: boolean;
};
