<img src="https://raw.githubusercontent.com/riftdweb/rift/main/assets/main.png" alt="Rift" width="100%" />

# Rift

[![Add to Homescreen](https://img.shields.io/badge/Skynet-Add%20To%20Homescreen-00c65e?logo=skynet&labelColor=0d0d0d)](https://homescreen.hns.siasky.net/#/skylink/AQBLTOv9uMFcNR_NRooBc6Rv7jb4it1cozkWEApU3roLEQ)

> Your personal **permissionless** and **encrypted** internet workspace.

## What

Rift is an app that aims to provide a decentralized alternative to the core Internet apps we all use and depend on every day.

Rift includes **document editing, file sharing, social feeds, search, video streaming**, as well as advanced tools for managing personal data, DNS, and more.

Rift is a work-in-progress but aims to provide the productivity, social, and developer features from Internet giants like Google, Facebook, or Amazon ...but reimagined as software you control.

> Rift gives you control over _your_ data, algorithms, privacy!

## Quick links

- [**Users**](#access-rift)
  - [**Access**](#access-rift)
  - [**About**](#about-rift)
  - [**Features**](#features)
    - [**Omni-search**](#omni-search)
    - [**Home**](#home)
    - [**Docs**](#docs)
    - [**Files**](#rift-files)
    - [**Uploads**](#uploads)
    - [**DNS**](#dns)
    - [**Ecosystem**](#ecosystem)
    - [**Settings**](#settings)
    - [**Dev tools**](#dev-tools)
- [**Developers**](#developers)
  - [**Complexity**](#complexity)
  - [**Architecture**](#architecture)
  - [**Tooling**](#tooling)
- [**Roadmap**](#goals-and-roadmap)

## Access Rift

#### Quick link

The Rift app can be accessed by navigating to [rift.sh](https://rift.sh) which redirects to siasky.net.

> [rift.sh](https://rift.sh)

#### Handshake

Alternatively, you can find Rift by visiting `riftapp.hns` on any Skynet Portal.

> https://riftapp.hns.siasky.net

#### Homescreen

Rift can also be accessed through [Skynet Homescreen](https://homescreen.hns.siasky.net/). Click the button below to add Rift to your Homescreen.

> [![Add to Homescreen](https://img.shields.io/badge/Skynet-Add%20To%20Homescreen-00c65e?logo=skynet&labelColor=0d0d0d)](https://homescreen.hns.siasky.net/#/skylink/AQBLTOv9uMFcNR_NRooBc6Rv7jb4it1cozkWEApU3roLEQ)

## About Rift

### Decentralized

Rift is built as a pure Skynet app, meaning its only dependency is access to the Skynet network. Rift can be accessed via any public or private Skynet Portal. It is important to note that Skynet Portals are entirely stateless and interchangeable. Any piece of data can be accessed from **_any_** Portal in under a few hundred milliseconds regardless of where on the network the data was originally written or pinned. If you decide to stop using a specific Portal your data will be immediately available from any other Portal.

### Permissionless

Rift and Skynet are permissionless and self-sovereign - anyone can create a network-wide pseudo-anonymous [Skynet account](https://blog.sia.tech/mysky-your-home-on-the-global-operating-system-of-the-future-5a288f89825c) which is just a cryptographic keypair. Only the key holder has the ability to access, decrypt, and modify data.

### Private

When signed in to Rift, all metadata and files are encrypted and stored in your personal file system on the Skynet network. Certain data such as a your profile and feed are intentionally made public but beyond this everything is encrypted and private by default.

### Open

In addition to storing all data in a private space, Rift runs on open data storage standards for things like files, profiles, posts, feeds, and the social graph. This means that with your permission, other applications can seamlessly access the exact same source data. This is important because it means your files and videos automatically move with you when you decide you like a different app for file sharing or video streaming.

### Fast

For a decentralized network and even more broadly, Skynet is very fast. Any data can be accessed from anywhere on the network in under a few hundred milliseconds without caching and writes propagate across the entire network within seconds. This means that files and media can be accessed and opened quickly in Rift, and videos can even be streamed.

## Features

### Omni-search

Rift omni-search is located on the main navbar and allows you to quickly access many useful functions. These include user search, user and skylink lookup, and will be expanded to include user files, registry entries, and more.

#### User search

Use Rift omni-search to find users. Search by username, first name, last name, location, about, user ID, or any other metadata. Rift user search does not call out to centralized servers or indexes - all results are found by indexing your social graph along with an initial seed-list of users. As you lookup and follow more users, the results will grow. There are also longer term plans to augment the search results with trustless external search indices.

<p align="center">
<img src="https://raw.githubusercontent.com/riftdweb/rift/main/assets/search/user-search.png" width="50%" alt="User search" />
</p>

#### Skylink Lookup

Use Rift omni-search to look up a skylink and view metadata including skylink type, skyfile type, content-type, file size, and health status.

<p align="center">
<img src="https://raw.githubusercontent.com/riftdweb/rift/main/assets/search/skylink-lookup.png" width="50%" alt="Skylink lookup" />
</p>

The Skylink context menu also includes many convenience functions for copying and formatting skylinks.

<p align="center">
<img src="https://raw.githubusercontent.com/riftdweb/rift/main/assets/search/skylink-lookup-context.png" width="50%" alt="Skylink lookup context" />
</p>

### Registry Lookup

> Coming soon

### File search

> Coming soon

### Home

Home is Rift's default page and is where you can find your social feeds and discover activity. This is where you can view friends and followers, navigate to their profiles, discover other users, browse the content in your social feeds, view a summary of activity from across your social graph, and navigate to advanced features such as digging into your personal "top" feed's ranking algorithm.

![Home](https://raw.githubusercontent.com/riftdweb/rift/main/assets/home/home.png)

#### Friends, followers, and suggestions

Followers are pulled directly from the Social DAC and the Rift indexer computes friends whenever mutual follows exist. The suggested users are pulled from users the indexer has discovered, which is initialized with a seed-list of known users.

#### Social feeds

Rift currently includes "latest" and "top" feeds of aggregated content. The latest feed is a reverse chronological feed of all posts from users that you are following. The top feed is a ranked feed of content scored according to an algorithm explained in the section on [algorithmic transparency](#algorithmic-transparency).

#### Algorithmic transparency

Besides custody of user data, another important aspect of user agency is transparency and control over the algorithms that process your data.

As explained in the [social feeds](#social-feeds) section , Rift generates the "top" feed by scoring and ranking posts from your social graph. The ranking algorithm (unfinished) takes into account a variety of signals such past content interactions, relationships from your social graph, activity around the piece of content such as comments, and recency.

Rift allows you to turn on a mode called "algorithmic transparency". The goal of this mode is to provide you with clear indications as to exactly why you are seeing a piece of content as well as how the algorithm will respond to further interactions. The mode currently highlights language concepts that factored into the ranking of content and also highlights brand new concepts that would factor in after further interaction. The goal is to eventually include and clearly indicate all data points such as how much the user making the post and other users engaging with the content factored in to scoring.

![Algorithmic transparency](https://raw.githubusercontent.com/riftdweb/rift/main/assets/home/algo-transparency.png)

The algorithmic transparency feature also includes a dedicated dashboard for visualizing the scoring process, showing how posts were originally scored, and how this score decays over time.

<p align="center">
<img src="https://raw.githubusercontent.com/riftdweb/rift/main/assets/home/algo-dashboard.png" width="50%" alt="Algorithm dashboard" />
</p>

The other core aspect to algorithmic transparency is user-control and personalization. Rift not only gives you a view into the scoring process, it also gives you the ability to adjust and tune your personal algorithm. Inside the feed algorithm dashboard you can boost or reduce the weight of different keyword concepts to adjust how content gets scored. The goal is to extend this and make all variables fully configurable.

<p align="center">
<img src="https://raw.githubusercontent.com/riftdweb/rift/main/assets/home/algo-tune.png" width="50%" alt="Algorithm tuning" />
</p>

#### Activity

Rift Home includes an activity feed that gives you a high-level view of activity from across your social graph. The feed summarizes user activity such as public posts, as well as more unique activity from other established apps such as SkyChess and SkyTransfer. The activity feed items provide a way for users to discover and interact with recent content.

<p align="center">
<img src="https://raw.githubusercontent.com/riftdweb/rift/main/assets/home/activity.png" width="50%" alt="Activity" />
</p>

### Docs

![Docs](https://raw.githubusercontent.com/riftdweb/rift/main/assets/docs/docs.png)

Rift Docs is a block-based document editor that supports a variety of content types and formatting options and includes keyboard and markdown shortcuts. Rift Docs will soon allow users to share documents and publish documents as webpages and to social feeds.

<h3><a id="user-content-rift-files" class="anchor" aria-hidden="true" href="#rift-files">Files</a></h3>

![Docs](https://raw.githubusercontent.com/riftdweb/rift/main/assets/files/files.png)

Rift Files is a file system feature that includes a file explorer with support for directories, drag and drop, file search, and full encryption. The file explorer includes content-specific viewers for things like viewing PDFs and streaming videos, this lets you manage and view your files and media right in the browser. Rift Files is built on the File System DAC which means that all the same files can be viewed through other applications such as Vup, a native suite of file explorer apps.

### Uploads

![Uploads](https://raw.githubusercontent.com/riftdweb/rift/main/assets/uploads/uploads.png)

Rift Uploads allows you to upload files to Skynet as Skyfiles or Skyfile directories. These uploads are added to a persistent list that shows upload progress, allows for filtering, and gives an overview of metadata such as file name, skylink, size, and the time of upload. The feature also provides convenience functions for copying common data to clipboard and quickly updating an existing DNS record. These files are uploaded without encryption so the feature is a convenient way to keep track of files meant to be publicly shared or used as websites.

### Data

![Data](https://raw.githubusercontent.com/riftdweb/rift/main/assets/data/data.png)

Rift Data is a developer-oriented feature for inspecting and updating SkyDB and MySky DAC data domains files. These are the JSON files that power Rift, data sharing standards (DACs), and everything on Skynet. The Rift Data tool provides a JSON editor and functions for saving, reverting, formatting and more.

Rift Data includes a tree-style file browser that can be configured to include common data domains. The wizard for adding data domains suggests common domains and files. Files can be edited depending on the permissions of the specific file.

![Add domain](https://raw.githubusercontent.com/riftdweb/rift/main/assets/data/add-domain.png)

If you are looking to inspect a specific file, any filepath can be manually added relative to any tree node.

![Add path](https://raw.githubusercontent.com/riftdweb/rift/main/assets/data/add-path.png)

The user being viewed can be changed by clicking on the user widget in the top-left corner. Changing the user allows you to view any of the same discoverable files for that specific user, such as the profile data in the example below.

![Change user](https://raw.githubusercontent.com/riftdweb/rift/main/assets/data/change-user.png)

### DNS

![DNS](https://raw.githubusercontent.com/riftdweb/rift/main/assets/dns/dns.png)

Rift DNS is a feature for managing resolver skylinks. Resolver skylinks are mutable skylinks that can be used to serve and dynamically update decentralized websites. Resolver skylinks are commonly used with Handshake, DNSLink, and ENS to serve websites. Rift DNS lets you create a record which will generate a new resolver skylink. Rift DNS also lets you update existing records which points the existing resolver skylink to a new data skylink.

### Ecosystem

The Rift Ecosystem tab features other amazing Skynet projects and some of the best resources for understanding Skynet.

### Settings

The Rift Settings tab provides basic MySky and seed functions as well as access to Rift's internal developer tools.

### Dev tools

Rift includes a few internal developer tools including a logging system and interfaces for indexing and task management introspection. Read more about these in the dedicated [Developer Tooling](#tooling) section.

# Developers

<a href="http://www.typescriptlang.org/index.html"><img src="https://badges.frapsoft.com/typescript/version/typescript-next.svg" alt="Typescript - Next"></a>
![Deploy To Skynet](https://github.com/riftdweb/rift/actions/workflows/deploy.yml/badge.svg)

> 🚧 Please note that the following documentation is a work-in-progress, thank you for reading!

The goal of this documentation is to share development patterns, strategies, and pitfalls with other developers looking to build on Skynet. In addition, a corresponding development goal is to extract the functionality described below into a Skynet Kernel module so that all Skynet app can share a single instance of the Rift indexer and data model. This will let app developers interface with straightforward APIs that abstract away much of the architectural complexity described below.

## Codebase

The Rift project is set up as a monorepo of apps, packages, and services. The project is installed by running `yarn`.

The `yarn` command will also run a postinstall script that directly links together all internal `@riftdweb/<dep>` dependencies so that cross-library changes can be made during development without the need to deal with installed versions or running independent build steps.

### Apps

- **@riftdweb/app** The Rift web application

### Packages

- **@riftdweb/core** Services, contexts, hooks, components, utils primarily used in the main app
- **@riftdweb/design-system** Design-system and component library
- **@riftdweb/queue** Custom task processing library necessary for the core Rift indexing services
- **@riftdweb/logger** Custom logger with name-spaced logging and workflow tracing
- **@riftdweb/types** Library of common types used across all Rift libraries
- **@riftdweb/skynet-js-iso** Unstable fork of skynet-js modified to be isomorphic and work with nodejs

### Services

- **@riftdweb/bots** Bot that mirrors arbitrary RSS feeds onto the Feed DAC, triggered by Github Action

## Complexity

Skynet applications follow a new paradigm. Although they can be built with familiar web technologies, they require a very different approach from traditional stateless client-server architectures. The approach is more similar to building peer-to-peer software, requiring significant local state and continuous processing. Due to Skynet's decentralized and user-controlled model, data is partitioned by user across the network and therefore client applications must handle all data indexing, transformation, and transactions. This results in difficulties around data access, data synchronization and consistency, transactional race conditions, and comes with a very different latency profile. External indexing services are a potential way to offload some of this processing and are a good fit for indexing features such as network-wide social feeds and search, but they add an element of trust and only cover a subset of unencrypted use cases, therefore a trustless and private decentralized application requires onboard indexing capabilities.

## Architecture

Rift is a web application built on top of a specialized indexing system. The indexer is built to keep data synchronized while prioritizing data necessary for features the user is actively interacting with. Rift's prioritization scheme is built on a custom task processing library that supports queuing, pooling, prioritization lanes, and rate limiting. With an endless supply of indexing, rate limiting is an important aspect in not overwhelming Portals and triggering throttling which would drastically slow down the indexing process which in turn would degrade the overall user experience. The generated indices are stored on Skynet so that they can be persisted and shared across sessions and clients.

#### Prioritization and responsive UX

Rift must index data such as profiles, social graphs, social feeds, and files from across hundreds of users. Initializing this data can take minutes to hours and keeping it up-to-date is a continuous process. Therefore Rift adjusts data expiry and prioritizes units of work, or tasks, based on how the user interacts with Rift features. Indexing and layered caching is critical for hiding latency and ensuring recent data is always available to support fast load times and a responsive user experience. Rift uses a custom task processing system explained below.

#### Prioritization levels

| Priority | Description                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------- |
| 0        | Low priority indexing lane for data from unfamiliar users that is not on screen                     |
| 1        | Indexing lane for data from familiar users that are not on screen                                   |
| 2        | Rendering lane for data that appears on screen                                                      |
| 3        | High priority indexing required for subsequent interaction                                          |
| 4        | Indexing lane for data that the user is interacting with or has actively requested to be re-indexed |

Below are two tables that demonstrate how some of the Rift internal functions prioritize and schedule specific user data for re-indexing. Beyond the following user data, prioritization and scheduling is also used for all other internal workflows such as aggregating feeds, activity, and reading and writing all data.

#### Example: Prioritization and data expiry for familiar users

| Operation | Priority | Profile   | Social    | Metadata  | Feed       |
| --------- | -------- | --------- | --------- | --------- | ---------- |
| Index     | 0        | 2 days    | 2 days    | 7 days    | 1 hour     |
| Render    | 2        | 2 days    | 2 days    | 2 days    | 20 minutes |
| Interact  | 4        | 2 minutes | 2 minutes | 2 minutes | 2 minutes  |
| Read      | 4        | 2 minutes | 2 minutes | Never     | Never      |
| Refresh   | 4        | Force     | Force     | Force     | Force      |

#### Example: Prioritization and data expiry for unfamiliar users

| Operation | Priority | Profile   | Social    | Metadata  | Feed      |
| --------- | -------- | --------- | --------- | --------- | --------- |
| Index     | 0        | 14 days   | 7 days    | 14 days   | Never     |
| Render    | 2        | 2 days    | 2 days    | 2 days    | Never     |
| Interact  | 4        | 2 minutes | 2 minutes | 2 minutes | 2 minutes |
| Read      | 4        | 2 minutes | 2 minutes | Never     | Never     |
| Refresh   | 4        | Force     | Force     | Force     | Force     |

> 💡 The ability to configure data expiry values could be a compelling feature for users with different preferences or data usage limits.

#### Eventual consistency

The goal of the Rift indexer is to provide eventual consistency, where the prioritization and expiration strategy supports a user experience where data is:

1. Passively (re)indexed ahead of probable interactions.
2. On interaction, rendered with a "stale-while-revalidate" pattern leveraging mostly-recent data while asynchronously re-indexing.
3. On unpredictable first-time interaction, indexed while the user waits.

#### Long-running cancelable workflows

The indexer is built from long-running workflows that fetch, transform, and cache data both locally and on the network. These workflows can take significant time and sometime must be paused, re-scheduled, or canceled. To achieve this functionality, all of these workflows are written as "cancelable async flows" using generators orchestrated with a runner. Each workflow is initialized with a token that can be used to cancel and clean up a task mid-workflow.

#### Task queueing, pooling, and rate limiting

The described task processing leverages a custom library (@riftdweb/queue) that supports queueing tasks, prioritizing tasks, reprioritizing tasks, sharing identical tasks, and dropping tasks. The library includes a TaskQueue mode that leverages a queue and pool size for configuring concurrency.

The library also includes a separate RateLimiter mode that employs a modified "leaky bucket" algorithm with a configurable burst and bucket size where overflow goes into a queue. Rift uses the RateLimiter to keep Portal requests within server-side rate limits to avoid getting throttled while maximizing requests per minute.

#### Simulated locking, transactions, and safe updates

Skynet data can be updated by any client application with the correct permissions. The only mechanism protecting data from race conditions and potential corruption or loss is an incremented revision number. Although there are plans to add more client-side safety to skynet-js for checking that revision numbers are incremented on any update, Rift also leverages queueing to ensure data is locked for updates that transform common data. Rift does this by modeling all updates to a specific resource as encapsulated transactions (tasks) that are processed with a TaskQueue configured to process each task sequentially with no parallelism. This pattern abstracts away dealing with race conditions locally and allows tasks to be re-run when they fail to compete with updates originating externally, from outside of Rift.

## Tooling

To support development using the above patterns, Rift includes a few internal developer tools including a logging system and interfaces for indexing and task management introspection.

### Logger

Rift code is instrumented with a custom logger (@riftdweb/logger) that provides name-spacing functionality so logs can be easily filtered during development and debugging. In addition, the logger supports workflow tracing. If a workflow ID is assigned, the log will start with a color-coded ID (first 5 characters).

![Logger](https://raw.githubusercontent.com/riftdweb/rift/main/assets/dev/logger.png)

### User indexing

The user indexing tool shows the status of every known user and the expiry status of each user's data resources, based on passive prioritization. When one or more user resources expires, the visible status will change to expired (red), and the internal tasks to update the expired pieces of data will get scheduled and show up in the task manager.

![User indexing](https://raw.githubusercontent.com/riftdweb/rift/main/assets/dev/user-indexing.png)

### Task manager

The task manager tool shows all active queues and their pending and queued tasks. The tasks show their metadata, priority (black), how many consumers are waiting (green), how many similar tasks are queued (red), and more.

![Task manager](https://raw.githubusercontent.com/riftdweb/rift/main/assets/dev/task-manager.png)

## Goals and roadmap

### Short term

- Create a best-in-class Skynet app for common social, productivity, and developer functionality.
- Extract the core Rift indexer into a Skynet Kernel module so all apps can tap in and share a single indexer and denormalized data model.
- Showcase what is possible on Skynet without centralized dependencies.

### Long-term

- Gradually build out a "decentralized Notion", where users can share files and and collaborate in real-time on a structured graph of information...a decentralized and collaborative knowledge base...a decentralized Internet!
