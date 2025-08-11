## How to set, and get accespted cards.

This module ought to achieve the following:

1. Set the accepted ideas
2. Find a way to identify those accepted ideas
3. Manage state from GeneratedIdeas itno AcceptedIdeasList
4. Find a way to update the state on the value propositions in the database.

### Intitial problems I am seeing:

One problem I am noticing is that I am using my canvas object as one big object with nested canvasSegments. Currently it is
canvasName
decisons
valueProposition[]
accepted[]
rejected[]
segments
customerSegments
valuePropositions
e.t.c
status
userId

Okay first I am noticing that I have already solved this problem. When a segment item is accepted e.g. a valueProposition item is accepted, it just goes to the decisions/segmentName/accepted array.

But my worry with this approach is the same thing I worry about the entire canvasSegments document - a flat structure might be better. It sucks to keep treack of so many nested objects and arrays inside one json item.

So I'm thinking: maybe lets change this to something like:

canvasName
valuePropositions
geenratedIdeas
acceptedIdeas
rejectedIdeas

customerSegments
geenratedIdeas
acceptedIdeas
rejectedIdeas
e.t.c

Or

valuePropositions
generatedIdea
acceptedProperty / idea
rejected property / idea

customerSegments
generatedIdea
acceptedProperty / idea
rejected property / idea
e.t.c

or

I could even reduce the abstraction even more by putting ideas directly inside canvasSegments

canvasName
generatedIdeas[]
{segment: valueProp || customerSegments,
id: "",
accepted: bool
... other data about the Idea"

    }

This way, from my valuePropositions client, I could return all objects in /canvasSegments/generatedIdeas where segment === valueProp.
Then in my client valuePropositions/acceptedIdeas I could have /canvasSegments/generatedIdeas where segment === valueProp && accepted

This seems the path that offers the best clarity and performance.

### How would I solve this?

Issue with this approach is that I have to change my current firestore structure.

I thought it was harder than that but I simply need to change the path:

```js
const segmentRef = users/{`userId1`}/canavasSegments/{`ideaId`}.doc
const data = {
    segmentId,
    segmentName,
    segmentData
}
//save each new geenrated idea to this path.
```

But the new structure requires a few structural changes to the way I am even creating the canavs too:

```js
const createSegmentsRef =  users/{`userId1`}/canvasSegments ? users/{`userId1`}/canvasSegments/
const
```

It looks like I don't need the createCanvas service because I can set a conditional in createSegments to check if a canvasSegments collection already exists. To save the segmentIdea if it does, and first creeate the collection, then save if it does not. Does firestore offer a way to do this?

I also need to change t
