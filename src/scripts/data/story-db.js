// src/scripts/data/story-db.js

import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const storyDb = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    // Pastikan Object Store dibuat jika belum ada
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
  },
});

const StoryDb = {
  // C (Create) / S (Save) - Menyimpan cerita baru
  async putStory(story) {
    return (await storyDb).put(OBJECT_STORE_NAME, story);
  },

  // R (Read) - Mengambil satu cerita berdasarkan ID
  async getStory(id) {
    return (await storyDb).get(OBJECT_STORE_NAME, id);
  },

  // R (Read) - Mengambil semua cerita
  async getAllStories() {
    return (await storyDb).getAll(OBJECT_STORE_NAME);
  },

  // D (Delete) - Menghapus cerita berdasarkan ID
  async deleteStory(id) {
    return (await storyDb).delete(OBJECT_STORE_NAME, id);
  },
};

export default StoryDb;