import { App } from '@riftdweb/types'
import { v4 as uuid } from 'uuid'

export const skapps: App[] = [
  {
    id: uuid(),
    hnsDomain: 'skyfeed.hns',
    name: 'SkyFeed',
    addedAt: new Date().getTime(),
    description:
      'Decentralized SkyDB-based alternative to Twitter, YouTube and Instagram with a native iOS, Android and web app.',
    tags: ['Social media', 'Video'],
    lockedOn: undefined,
    revisions: [],
  },
  {
    id: uuid(),
    hnsDomain: 'skysend.hns',
    name: 'SkySend',
    addedAt: new Date().getTime(),
    description:
      'An open source, highly secure, private and decentralized way to send and share your files.',
    tags: ['Secure', 'File sharing'],
    lockedOn: undefined,
    revisions: [],
  },
  {
    id: uuid(),
    hnsDomain: 'hackerpaste.hns',
    name: 'Hacker Paste',
    addedAt: new Date().getTime(),
    description:
      'A paste bin for Skynet. Hacker Paste is a one-of-a-kind text snippet sharing tool, secure by design and built for the decentralized web.',
    tags: ['Pastebin', 'File sharing'],
    lockedOn: undefined,
    revisions: [],
  },
  {
    id: uuid(),
    hnsDomain: 'skygallery.hns',
    name: 'SkyGallery',
    addedAt: new Date().getTime(),
    description:
      'SkyGallery is a basic media gallery Skapp that aims to provide an decentralized and opensource alternative to Imgur.',
    tags: ['Image sharing', 'Galleries'],
    lockedOn: undefined,
    revisions: [],
  },
  {
    id: uuid(),
    hnsDomain: 'skybrain.hns',
    name: 'SkyBrain',
    addedAt: new Date().getTime(),
    description:
      'The place where magic happens and you are able to store/manage memories and emotions, like happens in the human brain.',
    tags: ['Social media'],
    lockedOn: undefined,
    revisions: [],
  },
  {
    id: uuid(),
    hnsDomain: 'marstorage.hns',
    name: 'MarStorage',
    addedAt: new Date().getTime(),
    description:
      'Own your data. The 100% decentralized “Dropbox” and “Google Drive” alternative.',
    tags: ['File storage'],
    lockedOn: undefined,
    revisions: [],
  },
]
