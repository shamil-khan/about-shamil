import { useState, useCallback, useEffect, useMemo, type JSX } from 'react';
import {
  Trash2,
  RefreshCw,
  Users,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Loader2,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  createDocumentApiClient,
  ApiError,
  type DocumentMetadata,
} from '@/api-clients';

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a user with their associated documents for tree view display.
 */
type UserNode = {
  /** Unique user identifier */
  readonly userId: string;
  /** Number of documents owned by this user */
  readonly documentCount: number;
  /** Documents owned by this user */
  readonly documents: readonly DocumentMetadata[];
  /** Whether the user node is expanded in the tree view */
  isExpanded: boolean;
};

/**
 * Selection state for bulk operations.
 * Maps item IDs to their selected state.
 */
type SelectionMap = Readonly<Record<string, boolean>>;

// ============================================================================
// Components
// ============================================================================

/**
 * User tree node component with shadcn styling.
 * Displays a user with expandable document list.
 */
const UserTreeNode = ({
  user,
  selectedDocuments,
  onToggleUser,
  onToggleDocument,
  onToggleExpand,
}: {
  readonly user: UserNode;
  readonly selectedDocuments: SelectionMap;
  readonly onToggleUser: (
    userId: string,
    documentIds: readonly string[],
  ) => void;
  readonly onToggleDocument: (documentId: string) => void;
  readonly onToggleExpand: (userId: string) => void;
}): JSX.Element => {
  const userDocIds = useMemo(
    () => user.documents.map((d) => d.id),
    [user.documents],
  );
  const selectedCount = useMemo(
    () => userDocIds.filter((id) => selectedDocuments[id]).length,
    [userDocIds, selectedDocuments],
  );
  const isAllSelected =
    selectedCount === userDocIds.length && userDocIds.length > 0;
  const isIndeterminate =
    selectedCount > 0 && selectedCount < userDocIds.length;

  const handleUserToggle = useCallback(
    // (checked: boolean | 'indeterminate') => {
    () => {
      onToggleUser(user.userId, userDocIds);
    },
    [onToggleUser, user.userId, userDocIds],
  );

  return (
    <Card className='mb-3'>
      <CardHeader className='p-4 pb-0'>
        <button
          onClick={() => onToggleExpand(user.userId)}
          className='w-full flex items-center gap-3 text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors'
          type='button'>
          {user.isExpanded ? (
            <ChevronDown className='w-5 h-5 text-muted-foreground' />
          ) : (
            <ChevronRight className='w-5 h-5 text-muted-foreground' />
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={
                isAllSelected ? true : isIndeterminate ? 'indeterminate' : false
              }
              onCheckedChange={handleUserToggle}
              aria-label={`Select all documents for ${user.userId}`}
            />
          </div>
          <Users className='w-5 h-5 text-muted-foreground' />
          <span className='font-semibold flex-1'>{user.userId}</span>
          <Badge variant='secondary'>{user.documentCount} docs</Badge>
          {selectedCount > 0 && (
            <Badge variant='default'>{selectedCount} selected</Badge>
          )}
        </button>
      </CardHeader>

      {user.isExpanded && (
        <CardContent className='pt-4'>
          {user.documents.length === 0 ? (
            <p className='text-sm text-muted-foreground italic'>No documents</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'>Select</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead className='text-right'>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Checkbox
                        checked={!!selectedDocuments[doc.id]}
                        onCheckedChange={() => onToggleDocument(doc.id)}
                        aria-label={`Select document ${doc.profileName}`}
                      />
                    </TableCell>
                    <TableCell className='font-medium'>
                      <div className='flex items-center gap-2'>
                        <FileText className='w-4 h-4 text-muted-foreground' />
                        {doc.profileName}
                      </div>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      )}
    </Card>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

/**
 * System Admin Page component.
 * Provides system-wide document and user management using shadcn/ui.
 */
export const SystemAdminPage = (): JSX.Element => {
  // State: Data
  const [users, setUsers] = useState<readonly UserNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State: Selection
  const [selectedDocuments, setSelectedDocuments] = useState<SelectionMap>({});
  const [selectedUsers, setSelectedUsers] = useState<SelectionMap>({});

  // State: Dialogs
  const [deleteDocsDialogOpen, setDeleteDocsDialogOpen] = useState(false);
  const [deleteUsersDialogOpen, setDeleteUsersDialogOpen] = useState(false);
  const [resetStoreDialogOpen, setResetStoreDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const documentApi = createDocumentApiClient();

  // ==========================================================================
  // Data Loading
  // ==========================================================================

  const loadData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await documentApi.getAllDocumentsMetadata();

      // Group documents by user
      const userMap = new Map<string, DocumentMetadata[]>();
      result.forEach((doc) => {
        const userDocs = userMap.get(doc.userId) ?? [];
        userDocs.push(doc);
        userMap.set(doc.userId, userDocs);
      });

      // Convert to UserNode array
      const userNodes: UserNode[] = Array.from(userMap.entries()).map(
        ([userId, documents]): UserNode => ({
          userId,
          documentCount: documents.length,
          documents,
          isExpanded: false,
        }),
      );

      setUsers(userNodes);
    } catch (err) {
      toast.error(`Failed to load data: ${(err as ApiError).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [documentApi]);

  useEffect(() => {
    const nextLoad = () => {
      loadData();
    };
    void nextLoad();
  }, [loadData]);

  // ==========================================================================
  // Selection Handlers
  // ==========================================================================

  const toggleDocumentSelection = useCallback((documentId: string): void => {
    setSelectedDocuments((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  }, []);

  const toggleUserSelection = useCallback(
    (userId: string, documentIds: readonly string[]): void => {
      setSelectedUsers((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));

      const shouldSelect = !selectedUsers[userId];
      setSelectedDocuments((prev) => {
        const next: Record<string, boolean> = { ...prev };
        documentIds.forEach((id) => {
          next[id] = shouldSelect;
        });
        return next;
      });
    },
    [selectedUsers],
  );

  const toggleUserExpand = useCallback((userId: string): void => {
    setUsers((prev) =>
      prev.map((user) =>
        user.userId === userId
          ? { ...user, isExpanded: !user.isExpanded }
          : user,
      ),
    );
  }, []);

  const selectedDocumentIds = useMemo(
    () =>
      Object.entries(selectedDocuments)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [selectedDocuments],
  );

  const selectedUserIds = useMemo(
    () =>
      Object.entries(selectedUsers)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [selectedUsers],
  );

  // ==========================================================================
  // Bulk Operations
  // ==========================================================================

  const handleDeleteDocuments = useCallback(async (): Promise<void> => {
    if (selectedDocumentIds.length === 0) {
      toast.info('Please select documents to delete');
      return;
    }
    setDeleteDocsDialogOpen(true);
  }, [selectedDocumentIds]);

  const confirmDeleteDocuments = useCallback(async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const result =
        await documentApi.batchDeleteDocuments(selectedDocumentIds);
      toast.success(`Successfully deleted ${result.length} document(s)`);
      setSelectedDocuments({});
      await loadData();
    } catch (error) {
      const message = (error as ApiError).message ?? 'Unknown error';
      toast.error(`Error deleting documents: ${message}`);
    }
    setIsProcessing(false);
    setDeleteDocsDialogOpen(false);
  }, [selectedDocumentIds, loadData, documentApi]);

  const handleDeleteUsers = useCallback(async (): Promise<void> => {
    if (selectedUserIds.length === 0) {
      toast.info('Please select users to delete');
      return;
    }
    setDeleteUsersDialogOpen(true);
  }, [selectedUserIds]);

  const confirmDeleteUsers = useCallback(async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const result = await documentApi.batchDeleteDocuments(selectedUserIds);
      toast.success(`Successfully deleted ${result.length} user(s)`);
      setSelectedUsers({});
      setSelectedDocuments({});
      await loadData();
    } catch (error) {
      const message = (error as ApiError).message ?? 'Unknown error';
      toast.error(`Error deleting users: ${message}`);
    }
    setIsProcessing(false);
    setDeleteUsersDialogOpen(false);
  }, [selectedUserIds, loadData, documentApi]);

  const handleResetStore = useCallback(async (): Promise<void> => {
    setResetStoreDialogOpen(true);
  }, []);

  const confirmResetStore = useCallback(async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const result = await documentApi.resetStore();
      toast.success(`Store reset successfully ${result}`);
      setSelectedUsers({});
      setSelectedDocuments({});
      await loadData();
    } catch (error) {
      const message = (error as ApiError).message ?? 'Unknown error';
      toast.error(`Error resetting store: ${message}`);
    }
    setIsProcessing(false);
    setResetStoreDialogOpen(false);
  }, [loadData, documentApi]);

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
              System Administration
            </h1>
            <p className='text-muted-foreground mt-1'>
              Manage all users and documents across the system
            </p>
          </div>
          <Button variant='outline' onClick={loadData} disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className='max-w-6xl mx-auto mb-6 flex flex-wrap gap-3'>
        <Button
          variant='destructive'
          onClick={handleDeleteDocuments}
          disabled={selectedDocumentIds.length === 0 || isLoading}>
          <Trash2 className='w-4 h-4 mr-2' />
          Delete Documents
          {selectedDocumentIds.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {selectedDocumentIds.length}
            </Badge>
          )}
        </Button>

        <Button
          variant='destructive'
          onClick={handleDeleteUsers}
          disabled={selectedUserIds.length === 0 || isLoading}>
          <Trash2 className='w-4 h-4 mr-2' />
          Delete Users
          {selectedUserIds.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {selectedUserIds.length}
            </Badge>
          )}
        </Button>

        <div className='flex-1' />

        <Button
          variant='outline'
          onClick={handleResetStore}
          disabled={isLoading}
          className='border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground'>
          <AlertTriangle className='w-4 h-4 mr-2' />
          Reset Store
        </Button>
      </div>

      {/* Content */}
      <div className='max-w-6xl mx-auto'>
        {isLoading && users.length === 0 ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' />
          </div>
        ) : users.length === 0 ? (
          <Alert>
            <Users className='h-4 w-4' />
            <AlertTitle>No users found</AlertTitle>
            <AlertDescription>
              The system currently has no users or documents.
            </AlertDescription>
          </Alert>
        ) : (
          <div className='space-y-3'>
            {users.map((user) => (
              <UserTreeNode
                key={user.userId}
                user={user}
                selectedDocuments={selectedDocuments}
                onToggleUser={toggleUserSelection}
                onToggleDocument={toggleDocumentSelection}
                onToggleExpand={toggleUserExpand}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Documents Dialog */}
      <Dialog
        open={deleteDocsDialogOpen}
        onOpenChange={setDeleteDocsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5 text-destructive' />
              Delete Documents
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDocumentIds.length}{' '}
              document(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDocsDialogOpen(false)}
              disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDeleteDocuments}
              disabled={isProcessing}>
              {isProcessing && (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Users Dialog */}
      <Dialog
        open={deleteUsersDialogOpen}
        onOpenChange={setDeleteUsersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5 text-destructive' />
              Delete Users
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUserIds.length} user(s)
              and ALL their documents? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteUsersDialogOpen(false)}
              disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDeleteUsers}
              disabled={isProcessing}>
              {isProcessing && (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Store Dialog */}
      <Dialog
        open={resetStoreDialogOpen}
        onOpenChange={setResetStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='w-5 h-5' />
              Reset Store
            </DialogTitle>
            <DialogDescription className='text-destructive'>
              WARNING: This will delete ALL documents, users, and data from the
              system. This action CANNOT be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setResetStoreDialogOpen(false)}
              disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmResetStore}
              disabled={isProcessing}>
              {isProcessing && (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              )}
              Reset Store
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemAdminPage;
