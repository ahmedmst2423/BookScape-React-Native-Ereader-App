# BookSpace

**BookSpace** is a highly efficient e-reader app that leverages `epubjs-react-native` to seamlessly read EPUB files. With a user-friendly interface and multiple features, BookSpace is designed to enhance your reading experience.

---

## Features

### 1. Homepage and Reader Screen
<img src="./images/homepage.jpg" alt="Homepage" width="400">
<img src="./images/reader_screen.jpg" alt="Reader Screen" width="400">
<img src="./images/chapter_selection.jpg" alt="Chapter Selection" width="400">
<img src="./images/reader_settings.jpg" alt="Reader Settings" width="400">

The homepage displays all the available books in your selected directory, allowing you to easily browse through your collection. 
The reader screen allows you to read through you book using swipe right and left gestures. Using the swipe up and down gestures brings up the chapter selection and the settings menu.

---

### 2. Shelf
<img src="./images/shelf.jpg" alt="Shelf" width="400">

The Shelf page organizes your books into **Favorites** and **Finished** categories. Users can add books to the shelf directly from the homepage for easy access.

---

### 3. Book Scanner
<img src="./images/book scanner.jpg" alt="Book Scanner" width="400">
<img src="./images/book_scanner_result.jpg" alt="Book Scanner Result" width="400">

The Book Scanner uses **React Native Vision** to capture images of books through the camera. It then utilizes **Google Vision OCR** for text extraction and fetches detailed book information from the **OpenLibrary API**.

---

### 4. Nearby Bookstores
<img src="./images/nearby_bookstores.jpg" alt="Nearby Bookstores" width="400">

BookSpace fetches the user's location to display nearby bookstores, helping you discover places to purchase physical copies of books.

---

BookSpace combines convenience, functionality, and advanced technology to provide an exceptional reading experience. Download now and explore the world of books!

# Getting Started

> **Note**: Ensure you've completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions up to the "Creating a new application" step.

---

## Step 1: Start Metro Server

Run the following command from your project's root directory to start **Metro**, the JavaScript bundler:

```bash
# Using npm
npm start

# OR using Yarn
yarn start

npm run android
# OR
yarn android

npm run ios
# OR
yarn ios
