import { Inbox } from 'lucide-react';
import IconRenderer from './IconRenderer';

export default function EmptyState({
  icon = Inbox,
  title = 'No data found',
  description = 'There are no items to display at this time.',
  action,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="empty-state-icon">
        <IconRenderer icon={icon} size={40} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
