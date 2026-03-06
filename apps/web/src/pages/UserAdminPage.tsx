// ============================================================================
// User Admin Page (Shadcn UI)
// ============================================================================
// User-facing document management interface with file upload, inline editing,
// and document CRUD operations. Uses current user ID for all operations.
// ============================================================================

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type JSX,
} from 'react';
import {
  FileText,
  Trash2,
  RefreshCw,
  Edit3,
  Eye,
  Save,
  Loader2,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type {
  Document,
  DocumentMetadata,
  DocumentApiRequest,
  ContentPayload,
  LanguageCode,
} from '@/api-wrappers/DocumentApi/document';
import {
  LANGUAGE_CODE_LABELS,
  SUPPORTED_LANGUAGE_CODES,
  isValidLanguageCode,
} from '@/api-wrappers/DocumentApi/document';
import {
  documentApiClientSafe,
  isDocumentApiError,
} from '@/api-wrappers/DocumentApi/DocumentApiClient';

// ============================================================================
// Constants
// ============================================================================

/** Current user ID for all operations */
const CURRENT_USER_ID = 'test-user';

/** Supported MIME types for file upload */
// const SUPPORTED_MIME_TYPES = [
//   'application/pdf',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   'application/json',
//   'application/x-yaml',
//   'text/yaml',
//   'text/plain',
// ] as const;

/** Maximum file size: 10MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Initial rows for textarea */
// const INITIAL_TEXTAREA_ROWS = 30;

// ============================================================================
// Types
// ============================================================================

/**
 * Selection state for bulk operations.
 */
type SelectionMap = Readonly<Record<string, boolean>>;

/**
 * Form state for document creation/editing.
 */
type DocumentFormState = {
  readonly profileName: string;
  readonly languageCode: LanguageCode;
  readonly contentType: 'file' | 'inline';
  readonly file: File | null;
  readonly inlineContent: string;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Converts a File to base64 encoded string.
 * @param file - The file to convert
 * @returns Promise resolving to base64 string
 */
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Determines MIME type from file extension.
 * @param filename - The filename to check
 * @returns MIME type string
 */
const getMimeTypeFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'json':
      return 'application/json';
    case 'yaml':
    case 'yml':
      return 'application/x-yaml';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
};

// ============================================================================
// Main Page Component
// ============================================================================

/**
 * User Admin Page component.
 * Provides document management capabilities for the current user.
 */
export const UserAdminPage = (): JSX.Element => {
  // State: Data
  const [documents, setDocuments] = useState<readonly DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State: Selection
  const [selectedDocuments, setSelectedDocuments] = useState<SelectionMap>({});

  // State: Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSingleId, setDeleteSingleId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // State: Form
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [formState, setFormState] = useState<DocumentFormState>({
    profileName: '',
    languageCode: 'en',
    contentType: 'file',
    file: null,
    inlineContent: '',
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================================================
  // Data Loading
  // ==========================================================================

  const loadDocuments = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const result = await documentApiClientSafe.getAllDocuments();

    if (result.success) {
      setDocuments(result.data);
    } else {
      toast.error(`Failed to load documents: ${result.error}`);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const load = () => {
      loadDocuments();
    };
    void load();
  }, [loadDocuments]);

  // ==========================================================================
  // Selection Handlers
  // ==========================================================================

  const toggleDocumentSelection = useCallback((documentId: string): void => {
    setSelectedDocuments((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  }, []);

  const selectedDocumentIds = useMemo(
    () =>
      Object.entries(selectedDocuments)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [selectedDocuments],
  );

  // ==========================================================================
  // Form Handlers
  // ==========================================================================

  const resetForm = useCallback((): void => {
    setFormState({
      profileName: '',
      languageCode: 'en',
      contentType: 'file',
      file: null,
      inlineContent: '',
    });
    setEditingDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0] ?? null;
      if (file && file.size > MAX_FILE_SIZE) {
        toast.error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
        return;
      }
      setFormState((prev) => ({ ...prev, file }));
    },
    [],
  );

  const handleAddDocument = useCallback(async (): Promise<void> => {
    console.log('add document handler called', formState);
    if (!formState.profileName.trim()) {
      toast.error('Profile name is required');
      return;
    }

    setIsProcessing(true);

    try {
      let contentPayload: ContentPayload;

      if (formState.contentType === 'file' && formState.file) {
        const base64Data = await fileToBase64(formState.file);
        contentPayload = {
          data: base64Data,
          mimeType: getMimeTypeFromFilename(formState.file.name),
          fileName: formState.file.name,
          encoding: 'base64',
        };
      } else if (
        formState.contentType === 'inline' &&
        formState.inlineContent.trim()
      ) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(formState.inlineContent);
        const base64Data = btoa(
          Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''),
        );
        contentPayload = {
          data: base64Data,
          mimeType: 'text/plain',
          fileName: `${formState.profileName}.txt`,
          encoding: 'base64',
        };
      } else {
        toast.error('Please provide either a file or inline content');
        setIsProcessing(false);
        return;
      }

      const request: DocumentApiRequest = {
        profileName: formState.profileName.trim(),
        languageCode: formState.languageCode,
        content: contentPayload,
      };

      const result = await documentApiClientSafe.addDocument(request);

      if (result.success) {
        toast.success('Document created successfully');
        setAddDialogOpen(false);
        resetForm();
        void loadDocuments();
      } else {
        toast.error(`Failed to create document: ${result.error}`);
      }
    } catch (error) {
      const message = isDocumentApiError(error)
        ? error.message
        : 'Unknown error';
      toast.error(`Error creating document: ${message}`);
    }

    setIsProcessing(false);
  }, [formState, resetForm, loadDocuments]);

  const handleUpdateDocument = useCallback(async (): Promise<void> => {
    if (!editingDocument) return;

    setIsProcessing(true);

    try {
      let contentPayload: unknown;

      if (formState.contentType === 'file' && formState.file) {
        const base64Data = await fileToBase64(formState.file);
        contentPayload = {
          data: base64Data,
          mimeType: getMimeTypeFromFilename(formState.file.name),
          fileName: formState.file.name,
          encoding: 'base64',
        };
      } else if (formState.contentType === 'inline') {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(formState.inlineContent);
        const base64Data = btoa(
          Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''),
        );
        contentPayload = {
          data: base64Data,
          mimeType: 'text/plain',
          fileName: `${formState.profileName}.txt`,
          encoding: 'base64',
        };
      } else {
        toast.error('Please provide content to update');
        setIsProcessing(false);
        return;
      }

      const result = await documentApiClientSafe.updateContent(
        editingDocument.id,
        {
          content: contentPayload,
        },
      );

      if (result.success) {
        toast.success('Document updated successfully');
        setEditDialogOpen(false);
        resetForm();
        void loadDocuments();
      } else {
        toast.error(`Failed to update document: ${result.error}`);
      }
    } catch (error) {
      const message = isDocumentApiError(error)
        ? error.message
        : 'Unknown error';
      toast.error(`Error updating document: ${message}`);
    }

    setIsProcessing(false);
  }, [editingDocument, formState, resetForm, loadDocuments]);

  const openEditDialog = useCallback(
    async (documentId: string): Promise<void> => {
      const result = await documentApiClientSafe.getDocument(documentId);
      if (!result.success) {
        toast.error(`Failed to load document: ${result.error}`);
        return;
      }

      const doc = result.data;
      setEditingDocument(doc);

      // Determine content type and set form state
      if (doc.content.type === 'inline') {
        // Decode base64 content
        try {
          const decoded = atob(doc.content.data);
          setFormState({
            profileName: doc.profileName,
            languageCode: doc.languageCode,
            contentType: 'inline',
            file: null,
            inlineContent: decoded,
          });
        } catch {
          setFormState({
            profileName: doc.profileName,
            languageCode: doc.languageCode,
            contentType: 'inline',
            file: null,
            inlineContent: doc.content.data,
          });
        }
      } else {
        setFormState({
          profileName: doc.profileName,
          languageCode: doc.languageCode,
          contentType: 'file',
          file: null,
          inlineContent: '',
        });
      }

      setEditDialogOpen(true);
    },
    [],
  );

  const openViewDialog = useCallback(
    async (documentId: string): Promise<void> => {
      const result = await documentApiClientSafe.getDocument(documentId);
      if (!result.success) {
        toast.error(`Failed to load document: ${result.error}`);
        return;
      }
      setViewingDocument(result.data);
      setViewDialogOpen(true);
    },
    [],
  );

  const handleDeleteDocument = useCallback((documentId: string): void => {
    setDeleteSingleId(documentId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeleteDocument = useCallback(async (): Promise<void> => {
    if (!deleteSingleId) return;

    setIsProcessing(true);
    try {
      const result = await documentApiClientSafe.deleteDocument(deleteSingleId);
      if (result.success) {
        toast.success('Document deleted successfully');
        setSelectedDocuments((prev) => {
          const next: Record<string, boolean> = { ...prev };
          delete next[deleteSingleId];
          return next;
        });
        void loadDocuments();
      } else {
        toast.error(`Failed to delete document: ${result.error}`);
      }
    } catch (error) {
      const message = isDocumentApiError(error)
        ? error.message
        : 'Unknown error';
      toast.error(`Error deleting document: ${message}`);
    }
    setIsProcessing(false);
    setDeleteDialogOpen(false);
    setDeleteSingleId(null);
  }, [deleteSingleId, loadDocuments]);

  const handleDeleteDocuments = useCallback(async (): Promise<void> => {
    if (selectedDocumentIds.length === 0) {
      toast.info('Please select documents to delete');
      return;
    }
    setDeleteSingleId(null);
    setDeleteDialogOpen(true);
  }, [selectedDocumentIds]);

  const confirmDeleteDocuments = useCallback(async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const result =
        await documentApiClientSafe.deleteDocuments(selectedDocumentIds);
      if (result.success) {
        toast.success(`Deleted ${result.data.length} document(s)`);
        setSelectedDocuments({});
        void loadDocuments();
      } else {
        toast.error(`Failed to delete documents: ${result.error}`);
      }
    } catch (error) {
      const message = isDocumentApiError(error)
        ? error.message
        : 'Unknown error';
      toast.error(`Error deleting documents: ${message}`);
    }
    setIsProcessing(false);
    setDeleteDialogOpen(false);
  }, [selectedDocumentIds, loadDocuments]);

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderDocumentForm = useCallback(
    (isEdit: boolean): JSX.Element => (
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='profileName'>Profile Name</Label>
            <Input
              id='profileName'
              value={formState.profileName}
              disabled={isEdit}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  profileName: e.target.value,
                }))
              }
              placeholder='Enter profile name'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='languageCode'>Language</Label>
            <Select
              disabled={isEdit}
              value={formState.languageCode}
              onValueChange={(value) => {
                if (isValidLanguageCode(value)) {
                  setFormState((prev) => ({ ...prev, languageCode: value }));
                }
              }}>
              <SelectTrigger id='languageCode'>
                <SelectValue placeholder='Select language' />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGE_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {LANGUAGE_CODE_LABELS[code]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs
          value={formState.contentType}
          onValueChange={(v) =>
            setFormState((prev) => ({
              ...prev,
              contentType: v as 'file' | 'inline',
            }))
          }>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='file'>File Upload</TabsTrigger>
            <TabsTrigger value='inline'>Inline Text</TabsTrigger>
          </TabsList>

          <TabsContent value='file' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='file'>
                Upload File (TOML, JSON, YAML, TXT, PDF, DOC, DOCX)
              </Label>
              <Input
                id='file'
                ref={fileInputRef}
                type='file'
                accept='.toml,.json,.yaml,.yml,.txt,.pdf,.doc,.docx'
                onChange={handleFileChange}
              />
              {formState.file && (
                <p className='text-sm text-muted-foreground'>
                  Selected: {formState.file.name} (
                  {(formState.file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value='inline' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='inlineContent'>Content</Label>
              <Textarea
                id='inlineContent'
                value={formState.inlineContent}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    inlineContent: e.target.value,
                  }))
                }
                className='min-h-50 font-mono text-sm'
                placeholder='Enter your content here...'
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    ),
    [formState, handleFileChange],
  );

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className='min-h-screen bg-background p-6'>
      {/* Header */}
      <div className='max-w-6xl mx-auto mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              Document Management
            </h1>
            <p className='text-muted-foreground mt-1'>
              Manage your documents for user:{' '}
              <Badge variant='secondary'>{CURRENT_USER_ID}</Badge>
            </p>
          </div>
          <Button
            variant='outline'
            onClick={() => void loadDocuments()}
            disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className='max-w-6xl mx-auto mb-6 flex flex-wrap gap-3'>
        <Button onClick={() => setAddDialogOpen(true)} disabled={isLoading}>
          <Plus className='w-4 h-4 mr-2' />
          Add Document
        </Button>

        <Button
          variant='destructive'
          onClick={handleDeleteDocuments}
          disabled={selectedDocumentIds.length === 0 || isLoading}>
          <Trash2 className='w-4 h-4 mr-2' />
          Delete Selected
          {selectedDocumentIds.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {selectedDocumentIds.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className='max-w-6xl mx-auto'>
        {isLoading && documents.length === 0 ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' />
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <FileText className='w-12 h-12 text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>No documents found</p>
              <Button className='mt-4' onClick={() => setAddDialogOpen(true)}>
                <Plus className='w-4 h-4 mr-2' />
                Create your first document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'>Select</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead className='text-right'>Size</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Checkbox
                          checked={!!selectedDocuments[doc.id]}
                          onCheckedChange={() =>
                            toggleDocumentSelection(doc.id)
                          }
                          aria-label={`Select document ${doc.profileName}`}
                        />
                      </TableCell>
                      <TableCell className='font-medium'>
                        {doc.profileName}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{doc.languageCode}</Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {doc.contentInfo.fileName}
                      </TableCell>
                      <TableCell className='text-right text-muted-foreground'>
                        {(doc.contentInfo.size / 1024).toFixed(1)} KB
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => void openViewDialog(doc.id)}>
                            <Eye className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => void openEditDialog(doc.id)}>
                            <Edit3 className='w-4 h-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteDocument(doc.id)}
                            className='text-destructive hover:text-destructive'>
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Document Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetForm();
        }}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Add New Document</DialogTitle>
            <DialogDescription>
              Create a new document by uploading a file or entering text
              directly.
            </DialogDescription>
          </DialogHeader>
          {renderDocumentForm(false)}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setAddDialogOpen(false)}
              disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={() => handleAddDocument()} disabled={isProcessing}>
              {isProcessing && (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              )}
              <Save className='w-4 h-4 mr-2' />
              Create Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) resetForm();
        }}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Update the document content.</DialogDescription>
          </DialogHeader>
          {renderDocumentForm(true)}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setEditDialogOpen(false)}
              disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleUpdateDocument()}
              disabled={isProcessing}>
              {isProcessing && (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              )}
              <Save className='w-4 h-4 mr-2' />
              Update Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>View Document</DialogTitle>
            <DialogDescription>
              {viewingDocument?.profileName} ({viewingDocument?.languageCode})
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Filename:</span>{' '}
                {viewingDocument?.content.fileName}
              </div>
              <div>
                <span className='text-muted-foreground'>Size:</span>{' '}
                {viewingDocument?.content.type === 'inline'
                  ? `${viewingDocument.content.size} bytes`
                  : viewingDocument?.content.type === 'chunked'
                    ? `${viewingDocument.content.totalSize} bytes`
                    : `${viewingDocument?.content.size} bytes`}
              </div>
              <div>
                <span className='text-muted-foreground'>Type:</span>{' '}
                {viewingDocument?.content.type}
              </div>
              <div>
                <span className='text-muted-foreground'>Created:</span>{' '}
                {viewingDocument?.createdOn
                  ? new Date(viewingDocument.createdOn).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
            {viewingDocument?.content.type === 'inline' && (
              <div className='border rounded-lg p-4 bg-muted'>
                <pre className='text-sm whitespace-pre-wrap font-mono overflow-auto max-h-96'>
                  {(() => {
                    try {
                      return atob(viewingDocument.content.data);
                    } catch {
                      return viewingDocument.content.data;
                    }
                  })()}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='w-5 h-5' />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              {deleteSingleId
                ? 'Are you sure you want to delete this document? This action cannot be undone.'
                : `Are you sure you want to delete ${selectedDocumentIds.length} document(s)? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() =>
                void (deleteSingleId
                  ? confirmDeleteDocument()
                  : confirmDeleteDocuments())
              }
              disabled={isProcessing}>
              {isProcessing && (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              )}
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserAdminPage;
