/**
 * The document store reset response returned after resetting the system.
 */
export type DocumentStoreResetResponse = {
  /** The status can either be true or false.
   * The status is true, when reset operation succeed.
   * The staus id false, when reset operation failed.
   * */
  status: boolean;

  /**
   * The message contains detailed information for the status.
   * In case status is true, the message is a detailed information contains deleted document metadata.
   * In case status is false, the message is a detailed information about reason to fail.
   */
  message: string;
};
