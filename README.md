# Renvintory

This is an inventory tracking app I created while bartending the Kansas City Renaissance Festival. It allows users in each location to easily track opening and closing inventory, log spillage/intake, and generate the necessary post-shift reports to simplify our closing paperwork.

## Features

### Inventory tracking
There are four different kind of inventories grouped together for each date/location combination:
- **Open** - Opening counts
- **Close** - Final counts at end of day
- **Spill** - Track spilled or wasted items
- **Intake** - Track product received mid-shift

![Inventories](/assets/readme/01-inventories.png)

Each inventory page shows an interactive counting interface with increment/decrement controls for each item.

![Counter](/assets/readme/02-counts.png)

### Item/Container Management
Each location has a list of items that are available there. To simplify counting, each item has a list of container sizes that it comes in (eg. 1 can, 4-pack, 6-pack, 24-pack).

The interface encourages the user to count in a natural way - "I have 4 x 24-packs, 3 x 4-packs, and 7 individual cans". This counting method also allows the user to visually verify their counts at a glance once finished.

![Container counts](/assets/readme/03-container-counts.png)

The UI also allows users to manage items available at each location, as well as the container sizes available for each item.

![Item management](/assets/readme/04-items.png)

### Reporting

There are four types of reports, one for each inventory type. Open, spill, and intake inventory types simply show a list of each item and it's counts for that inventory.

The closing report shows a breakdown that combines all four reports and shows all values that we need to fill out on our closing paperwork, calculating totals, profits, etc. It shows the following fields:

- Item name
- Price
- Open count
- Close count
- Intake count
- Spill count
- Open + intake (total of starting/received inventory for the location)
- Total used (including spilled)
- Spilled value ($ value of items spilled)
- Sales ($ value of items used, minus the spilled value)

![Closing report](/assets/readme/05-report.png)

## Tech Stack

- **Frontend**:
  - [SvelteKit 5](https://svelte.dev/docs/kit/introduction) UI framework
  - [TypeScript](https://www.typescriptlang.org/) for type safety
  - [TailwindCSS](https://tailwindcss.com/) styling
  - [DaisyUI](https://daisyui.com/) Tailwind components
- **Backend**:
  - [Convex](https://www.convex.dev/) (serverless backend with real-time queries)
- **Build**:
  - [Vite](https://vite.dev/)
  - [Prettier](https://prettier.io/) for code formatting

## Data Model
- **Locations**: Name, array of item IDs
- **Items**: Name, price, array of container IDs
- **Containers**: Size (number), type (can/bottle/cup)
- **Inventories**: Location ID, date, inventory type (open/close/spill/intake), creation timestamp
- **Counts**: Inventory ID, item ID, container ID, count (number)

Convex schema:

```ts
export default defineSchema({
	locations: defineTable({
		_id: v.id('locations'),
		name: v.string(),
		items: v.array(v.id('items'))
	}),
	inventories: defineTable({
		_id: v.id('inventories'),
		locationId: v.id('locations'),
		date: v.string(),
		inventoryType: v.union(v.literal('open'), v.literal('close'), v.literal('spill'), v.literal('intake')), //timeOfDay: v.string(),
		createdAt: v.string()
	})
		.index('by_date', ['date'])
		.index('by_location_date', ['locationId', 'date']),
	items: defineTable({
		_id: v.id('items'),
		name: v.string(),
		price: v.number(),
		containers: v.array(v.id('containers'))
	}),
	containers: defineTable({
		_id: v.id('containers'),
		size: v.number(),
		type: v.union(v.literal('can'), v.literal('bottle'), v.literal('cup'))
	}),
	counts: defineTable({
		_id: v.id('counts'),
		inventoryId: v.id('inventories'),
		itemId: v.id('items'),
		containerId: v.id('containers'),
		count: v.number()
	})
		.index('by_item', ['itemId'])
		.index('by_inventory_item', ['inventoryId', 'itemId'])
});
```

## User Guide
See the [User Guide](/USER_GUIDE.md)

## Development

### Installation steps
You'll need to have Node.js, npm, and npx (`npm i -g npx`) installed as prerequisites.

You'll also need to [sign up for a Convex account](https://www.convex.dev/signup)

Clone the repository:
```bash
# For HTTPS:
git clone https://github.com/slimnate/renvintory.git

# For SSH
git clone git@github.com:slimnate/renvintory.git
```

Install dependencies:
```bash
npm install
```

### Configure convex deployment
```bash
npx convex dev
```
and follow the instructions to create/select and existing convex deployment. This will create the following envirnoment variables:
```
CONVEX_DEPLOYMENT=<deployment_name>
PUBLIC_CONVEX_URL=<deployment_url>
```

### Run development server
```bash
npm run dev
```
This runs the `npm convex dev` and `vite dev` commands in parallel to keep convex functions up to date and serve live changes

## Deployment
Deploying to production requires that:
- convex env variables are set:
  - `CONVEX_DEPLOYMENT`
  - `PUBLIC_CONVEX_URL`
  - `CONVEX_DEPLOY_KEY` - Credentials for convex deploy command - create production deployment in convex dashboard and generate this key before deployment. See [convex docs](https://docs.convex.dev/cli#deploy-convex-functions-to-production) for more info
- convex code is generated and functions deployed to production at build time: `npx convex deploy --cmd 'npm run build'`

## Project Status

Current version: `1.0.0`

Planned improvements:
- **Location management** - Allow users to add/remove locations
- **Spill reasons** - Allow users to track spill reasons (conplex improvement since spills are tracked as integer values, not separate database rows that can have a reason field added)
- **Batch incrementing** - Batch database increment calls on the count pages to avoid separate database calls for every single increment operation
- **Error messages** - Make error messages more user friendly by stripping line numbers, request ID, etc from displayed error toast messages
- **UI** -  make it pretty!