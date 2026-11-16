// Reference component for the react-component skill.
// Shows: props interface, named export, loading/error/empty states, accessible markup.
import styles from './UserList.module.scss';
import { useUsers } from '@/hooks/useUsers';

export interface UserListProps {
  /** Called when a user row is selected. */
  onSelect: (userId: string) => void;
  /** Max number of users to show. */
  limit?: number;
}

export function UserList({ onSelect, limit = 20 }: UserListProps) {
  const { data: users, isLoading, error, refetch } = useUsers({ limit });

  if (isLoading) {
    return <p role="status">Loading users…</p>;
  }

  if (error) {
    return (
      <div role="alert" className={styles.error}>
        <p>Could not load users.</p>
        <button type="button" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  if (!users?.length) {
    return <p className={styles.empty}>No users yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {users.map((user) => (
        <li key={user.id}>
          <button type="button" className={styles.row} onClick={() => onSelect(user.id)}>
            <img src={user.avatarUrl} alt="" width={32} height={32} />
            <span>{user.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
