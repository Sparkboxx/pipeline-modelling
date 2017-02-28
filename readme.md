# Pipeline Modeling Language

## Introduction

Diagrams are a good help when designing, describing or explaining how systems work. In order to help with the design and explanation of data pipelines (on AWS) we created a modelling language. The models capture data pipelines, their components and inter-connections  

The visual language is “white board proof” meaning that it can easily be drawn on a whiteboard but it is also made suitable to use basic tools like keynote and powerpoint, or slightly more advanced modelling tools like omnigraffle and Visio.

The models gradually stiffens during a design. You can design your high level pipeline using only a couple of simple symbols and dive into more details of your architecture later by the basic shapes. We hope this helps you keep your focus at the right abstraction level. 

## What is a pipeline

A pipeline is any path (through code) that starts at a trigger or event and ends in a data store. Very often you can spot pipelines by following the arrows that connect 2 datastore. A pipeline can consist of many other pipelines. In general we would say: if you can slap a name on a process between 2 datastore, it probably is, or should become a pipeline. 

![sample pipeline](./images/example_pipeline.png)

## Basic Shapes

There are a few basic shapes: circles, double-squares, triangles, arrows and rectangles. If you can draw these shapes you can model data pipelines on a whiteboard or cobble sketches together in a tool like powerpoint or keynote. 

| Shape | Image | Description |
| ----- | ----- | ----------- |
| Processor  | ![processor](./images/def_processor.png)   | *Circle with an optional type indication inside. Name Required.* <br><br> A processor is a component that takes takes input data, processes it and writes its output. This normally means a processor transforms the input data into something new. A processor can be “always on”, or can be triggered by an event or manual action. A processor can take its input and send its output anywhere: a data store, a queue, a stream or another processor. Likewise for its output. |
| Data Store | ![data store](./images/def_data_store.png) | *Square with a rectangular bar on top. the main square can contain a type indication. Name required.* <br><br> A data store is a persistent or temporary datastore of any type. The definition is quite liberal. S3 is seen as a key value store and uses the same symbol as a.o DynamoDB and Postgresql. |
| Trigger    | ![trigger](./images/def_trigger.png)       | *Triangle with a possible type indication inside. Name Optional.* <br><br> A trigger is a process that kicks of a pipeline.                                                                                                                                                                            |
| Flow       | ![flow](./images/def_flow.png)             | *Arrow with at least 1 arrow head that indicates the flow of information. Name optional.* <br><br> Flow is the connection between processors, storage and triggers. Flow comes in different types like: synchronous, asynchronous, queued and streaming.                                                                       |
| Other      | ![other](./images/def_other.png)           | *Rectangle, no fill, identifier inside. Name optional.* <br><br> If it isn’t a processor, a data store or a trigger. It’s probably something else. Represented by a rectangle. There are some variations on the “other” icon, but if it fits, write the name of the system in the rectangle. |
| External   | ![external](./images/def_external.png)     | *Rectangle, solid fill. Name required.* <br><br> Sometimes you simply don’t care, do you? When your boundaries are strong it’s often enough to model an external system as a black box.                                                                                      |

## Processors

A processor is a piece of software that takes takes input data, processes it and writes its output. A processor can be “always on”, or can be triggered by an event or manual action. A processor can take its input from a data store or from a queue or stream. Likewise its output. 

![Processor](./images/def_processor.png)
![Lambda Processor](./images/def_processor_lambda.png)

### Origin of the Symbol

A circle is one of the easiest shapes to draw on a whiteboard and has some nice space inside to annotate the type of a processor.

### Processor Types

Currently there are symbols for 2 processor types:

*	Standard (whatever that means for you)
*	Lambda processors, referring to Amazon AWS Lambda functions.

### What’s in a processor?

A “standard” processor can represent a lot. In the case of a non-lambda processor it can mean that there is a cloud formation stack that launches 1 or more instances of the processor in an autoscaling group. It also means there is an automated build and release process ready, a git repository, cloud watch logs, monitoring and all other luxuries that belong to a piece of software. Not bad for just a circle.

![Examples of processors](./images/processors_examples.png)

## Triggers

Triggers are the starts of pipelines. A trigger can be manual, event or timed (e.g. cron).  

### Origin of the Symbol

The circle and rectangle like symbols were taken. So we picked the triangle next. 

### Processor Types

Currently there are symbols for 4 trigger types:

| trigger type | image | description |
| ------------ | ----  | ----------- |
| standard | ![trigger](./images/def_trigger.png) | |
| manual trigger | ![manual trigger](./images/def_trigger_manual.png) | A manual trigger is a trigger that a human manually triggers. This can be by pressing buttons in the was console, using a CLI command or by pressing a button on a website. |
| timed trigger | ![timed trigger](./images/def_trigger_timed.png) | A timed trigger is a trigger that somehow runs on a timed schedule. The most likely timed trigger is a small piece of code that runs regularly using something like cron. An example of a timed trigger is an AWS Lambda function that runs according to timed cloud watch events. The timed trigger is denoted by a capital L. Where the L stands for the two hands of a clock. On a whiteboard you might actually make it look more like a 2 o'clock symbol. |
| event trigger | ![event trigger](./images/def_trigger_event.png) | An evented trigger executes when an event happens. An event could be a cloud watch alarm or a custom cloud watch event firing a lambda function. |

### Double type triggers

A manual trigger is the “most basic” trigger, since you will normally see that each trigger can somehow be manually invoked. Therefore, if the same trigger is of 2 types, e.g. manual and typed, we only model the typed version. 

An example of this is a lambda function that starts a pipeline. The lambda itself is seen as the trigger in this case. If that lambda gets invoked by hand, through the aws cli or console, this is seen as a manual trigger.

## Data Storage

Sooner or later you want to retrieve or store some data somewhere. When modelling a pipeline it doesn’t always matter where. Especially when working at high abstraction levels you don’t want to make a choice of data store (just yet). We model a data store after a common symbol for a relational database table in UML, but don’t be fooled, the symbol just represent “a datastore” not a relational datastore specifically. 

We mark the type of the datastore by the first letter or a short abbreviation of the actual datastore. 

![Data Store Examples](./images/data_storage_examples.png)

### Origin of the Symbol

Modelled after the table and class icons in UML. It’s easy to draw on a whiteboard Start with something that comes close to a square and then at about 1/5th of the top, draw a horizontal line. In software, draw a square first, then position a small rectangle on top and join the shapes. That way you can write the letter of your datastore in the centre of the bottom rectangle.

### Data Store Types

Below is a non extensive list of data store types. As with the processors the
naming is (roughly) as follows:

* Use the first letter of the data store, capitalized. Unless the datastore has
  a standard abbreviation of 2 characters.
* If the resulting letter is ambiguous, this is no problem if it's clear (to you
  and your team) from the diagram what the data store is. 
* To disambiguate add an extra letter, or a '.'.
* For Aurora, add the the A after the database type.

| Data store         | Symbol |
| ----------         | ------ |
| DynamoDB           | D      |
| Postgresql         | P      |
| S3                 | S3     |
| Redis or Redshift  | R      |
| Redis              | RD     |
| RedShift           | RS     |
| MySQL or Memcached | M      |
| MySQL              | M.     |
| Memcached          | MD     |
| Microsoft SQL      | MS     |
| Aurora             | A      |
| Aurora MySQL       | MA     |
| Aurora Postgres    | PA     |
| Memcached          | MC     |
| Oracle             | O      |



## Flow

Flow of data is represented by arrows. The data flows from the straight end towards the arrowhead. So if a processor requests data from a datastore you would see the arrow head attached to the processor. And if a processor writes data into a datastore, the arrowhead will be touching the datastore.

### Origin of the Symbol

It’s an arrow. The symbols to denote the different types are chosen in a way that you can add them to a line afterwards, and that removing them from a line doesn’t need a whiteboard wiper. (but might give you a bit of  paint on your finger)

### Processor Types

| flow type | image | description |
| --------- | ----- | ----------- |
| flow | ![flow](./images/def_flow.png) | *An arrow with 1 arrow head.* |
| Asynchronous invocation | ![Asynchronous flow](./images/def_flow_async.png) | *Line marked with a capital A on the line. where the (imaginary) dash of the A lines up with the line and can be omitted.* |
| Steaming or evented flow| ![Streaming flow](./images/def_flow_streaming.png) | *Line marked with a N on the line.* This line can be used to depict Kinesis streams, DynamoDB update streams, Kinesis Firehoses or streams on a Kafka topic.|
| Synchronous | ![Synchonous flow](./images/def_flow_sync.png) | *A line with 2 arrow heads.* | 
| Queued | ![Queued flow](./images/def_flow_queue.png) | *A line marked with a 90 degree angled "stop line" midway.* |

### Synchronous or bi-directional?

We make no difference. If you execute a process synchronously you are apparently interested in the result of that function, hence you both send (invoke) and receive (get the return value) of that function. 

In cases where you fire and forget into a system but read back from that same system at a later point in time you can draw 2 arrows.

### Limitations limitations

Let the drawing teach you something about your models. If you need too many arrows, arrows start crossing or you start having more than 1 arrow between 2 components, take a look at your design. Can it be simplified?

## Miscellaneous

A couple of other icons have proven to be useful in designing and annotating pipelines.

### User facing app

Data pipelines tend to be a computer only business. However, humans often need to configure or change configurations or peek into the data. For that reason we have a user facing app icon. A square with a diagonal cross inside. It’s easy to draw and not easily confused with the external component and the data sources.

![User Facing App](./images/def_misc_user_facing.png)

### Other kinds of systems

A rectangle. If possible with a description of the external system inside the rectangle, and possibly an extra annotation on the label. The example image shows an external Kafka system.
By writing the name of the system in the rectangle you can use the label for an extra annotation. For example the name of the kafka stream.

![Other](./images/def_misc_kafka.png)

### Humans

It’s nice to be able to put some humans in a picture, especially when you add names or roles to the picture.

![Humans](./images/def_misc_human.png)

### Annotations

Sometimes you want to write just a little bit more than a processor or data store name. You can annotate any element in the picture by writing text and using a left and right outer line on a rectangle. Like shown next to this text.  In software packages it is enough just to provide the left and right edge of a box. On the whiteboard it helps to go “just a little around the corner” in order to have the human eye catch the box. 

Why this shape? And why left and right? Because its easy to write your text first and annotate afterwards by drawing a “box without lines” around it. If you want to extend your text you only have to remove the top or bottom 2 small edges.

![Annotations](./images/def_misc_annotations.png)

### Lists and repetitions

Sometimes you run a list of processors in a pipeline that all do the same. For processors this is depicted by overlapping circles, on a whiteboard often drawn as a spiral. Next to the spiral you can optionally annotate the list of processors with a bounding box with the top and bottom lines coloured.

![Lists](./images/def_misc_lists.png)

### Grouping

Sometimes you want to group some items together. To indicate a separate AWS account or VPC, or indicate developer responsibilities. For grouping we use a dashed bounding box with a label attached to it on the outside.

![Lists](./images/def_misc_grouping.png)

## Modeling Rules

There are some basic guidelines on the modelling of pipelines.

*	Processors, data stores and external systems need names. 
*	Names are optional for flows and triggers. 
*	Names can be written down above or below the icon. Try to avoid putting a name on the side of the icon.
*	If it can be avoided, do not rotate names. With a bit of creativity you can probably find a way to write a name above or below a shape.
*	Try not to forget to put arrow markers on flow lines. That way it’s clear what the flow of data is. When data flows both ways, put 2 arrow heads on the flow line.

![right](./images/modeling_right.png) 

![wrong](./images/modeling_wrong.png)
