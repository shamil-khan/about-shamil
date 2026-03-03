/**
 * The document response returned after creating, updating and deleting a document.
 */
export type DocumentResponse = {
  /** The document ID.
   * For creation, it is auto generated document id.
   * For updation, it is updated document id.
   * For deletion, it is the document id which is deleted.
   * */
  documentId: string;

  /** The timestamp.
   * For creation, it is auto generated createdOn timestamp.
   * For updation, it is auto generated updatedOn timestamp.
   * For deletion, it is auto generated timestamp.
   * */
  timestamp: string;

  /** The status can either be true or false.
   * The status is true, when creation/updation/deletion operation succeed.
   * The staus id false, when creation/updation/deletion operation failed.
   */
  status: boolean;

  /**
   * The message contains detailed information for the status.
   * In case status is true, the message is a detailed information contains document metadata.
   * In case status is false, the message is a detailed information about reason to fail.
   */
  message: string;
};
