import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

interface PrivateMessage {
  id: string;
  userId: string;
  userEmail: string;
  message: string;
  responseId: string;
  response: string;
  timestamp: string;
  isPrivate: boolean;
}

export class PrivateMessageHistory {
  static async savePrivateMessage(
    userId: string,
    userEmail: string,
    userMessage: string,
    aiResponse: string,
  ): Promise<void> {
    try {
      const messageId = `msg_${Date.now()}`;
      const responseId = `resp_${Date.now()}`;

      const messageDoc: PrivateMessage = {
        id: messageId,
        userId,
        userEmail,
        message: userMessage,
        responseId,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        isPrivate: true,
      };

      await setDoc(
        doc(db, "private_messages", userId, "history", messageId),
        messageDoc,
      );
    } catch (err) {
      console.error("Error saving private message:", err);
    }
  }

  static async getPrivateMessages(userId: string): Promise<PrivateMessage[]> {
    try {
      const querySnapshot = await getDocs(
        collection(db, "private_messages", userId, "history"),
      );
      return querySnapshot.docs.map((doc) => doc.data() as PrivateMessage);
    } catch (err) {
      console.error("Error retrieving private messages:", err);
      return [];
    }
  }

  static async deletePrivateMessage(
    userId: string,
    messageId: string,
  ): Promise<void> {
    try {
      await setDoc(
        doc(db, "private_messages", userId, "history", messageId),
        { deleted: true, deletedAt: new Date().toISOString() },
        { merge: true },
      );
    } catch (err) {
      console.error("Error deleting private message:", err);
    }
  }

  static async clearAllPrivateMessages(userId: string): Promise<void> {
    try {
      const querySnapshot = await getDocs(
        collection(db, "private_messages", userId, "history"),
      );
      for (const doc of querySnapshot.docs) {
        await setDoc(
          doc.ref,
          {
            deleted: true,
            deletedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      }
    } catch (err) {
      console.error("Error clearing private messages:", err);
    }
  }
}
