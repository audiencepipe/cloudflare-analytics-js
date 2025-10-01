import { CoreCloudflareEvent } from '../events'
import { ValidationError } from './errors'
import { isString, isPlainObject, exists } from './helpers'

const stringError = 'is not a string'
const objError = 'is not an object'
const nilError = 'is nil'

export function assertUserIdentity(event: CoreCloudflareEvent): void {
  const USER_FIELD_NAME = '.userId/anonymousId/previousId/groupId'

  const getAnyUserId = (event: CoreCloudflareEvent) =>
    event.userId ?? event.anonymousId ?? event.groupId ?? event.previousId

  const id = getAnyUserId(event)
  if (!exists(id)) {
    throw new ValidationError(USER_FIELD_NAME, nilError)
  } else if (!isString(id)) {
    throw new ValidationError(USER_FIELD_NAME, stringError)
  }
}

export function assertEventExists(
  event?: CoreCloudflareEvent | null
): asserts event is CoreCloudflareEvent {
  if (!exists(event)) {
    throw new ValidationError('Event', nilError)
  }
  if (typeof event !== 'object') {
    throw new ValidationError('Event', objError)
  }
}

export function assertEventType(event: CoreCloudflareEvent): void {
  if (!isString(event.type)) {
    throw new ValidationError('.type', stringError)
  }
}

export function assertTrackEventName(event: CoreCloudflareEvent): void {
  if (!isString(event.event)) {
    throw new ValidationError('.event', stringError)
  }
}

export function assertTrackEventProperties(event: CoreCloudflareEvent): void {
  if (!isPlainObject(event.properties)) {
    throw new ValidationError('.properties', objError)
  }
}

export function assertTraits(event: CoreCloudflareEvent): void {
  if (!isPlainObject(event.traits)) {
    throw new ValidationError('.traits', objError)
  }
}

export function validateEvent(event?: CoreCloudflareEvent | null) {
  assertEventExists(event)
  assertEventType(event)

  if (event.type === 'track') {
    assertTrackEventName(event)
    assertTrackEventProperties(event)
  }

  if (['group', 'identify'].includes(event.type)) {
    assertTraits(event)
  }

  assertUserIdentity(event)
}
