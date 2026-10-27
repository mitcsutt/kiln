import {
  IconButton,
  Indicator,
  List,
  MessageIcon,
  Popover,
  RelativeTime,
  Spinner,
  StatusDot,
  Text,
} from '@mitcsutt/kiln-ui'
import { useEffect, useState } from 'react'

import { fetchNotices, type Notice } from '#data/currentUser'

/** The bell: unread notices, fetched when the header mounts. */
export function NoticesMenu() {
  const [notices, setNotices] = useState<Notice[] | null>(null)
  useEffect(() => {
    let live = true
    void fetchNotices().then((next) => {
      if (live) setNotices(next)
    })
    return () => {
      live = false
    }
  }, [])
  const count = notices?.length ?? 0
  return (
    <Popover>
      <Indicator count={count} label={`${String(count)} unread notices`} hidden={count === 0}>
        <Popover.Trigger asChild>
          <IconButton variant="ghost" label="Notices" icon={<MessageIcon />} />
        </Popover.Trigger>
      </Indicator>
      <Popover.Content aria-label="Notices" arrow>
        {notices === null ? (
          <Spinner label="Loading notices" />
        ) : (
          <List density="compact">
            {notices.map((notice) => (
              <List.Item key={notice.id}>
                <List.Leading>
                  <StatusDot tone={notice.tone} label={notice.tone} labelHidden />
                </List.Leading>
                <List.Content>
                  <Text size="sm">{notice.title}</Text>
                  <List.Description>
                    <RelativeTime date={notice.at} />
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        )}
      </Popover.Content>
    </Popover>
  )
}
