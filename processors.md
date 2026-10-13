---
layout: page
title: Processors
parent: Notation
nav_order: 1
---

# Processors

A processor is a piece of software that takes input data, processes it and writes its output. A processor can be “always on”, or can be triggered by an event or manual action. A processor can take its input from a data store or from a queue or stream. Likewise its output. 

{% include diagram.html name="def_processor" alt="Processor" %}
{% include diagram.html name="def_processor_lambda" alt="Lambda Processor" %}
{% include diagram.html name="def_processor_kafka_stream" alt="Kafka Stream Processor" %}

{: .origin }
> A circle is one of the easiest shapes to draw on a whiteboard and has some nice space inside to annotate the type of a processor.

## Processor Types

There are 2 basic processor types:

*	Standard (whatever that means for you).
*	Lambda processors, referring to Amazon AWS Lambda functions.

On top of that you can mark the language or technology of a processor with a
short letter code inside the circle.

## Letter Codes

The naming follows the same idea as the [data store](data-storage.html) codes:

* Use the first letter of the language, capitalized.
* A single letter can be ambiguous. That is no problem as long as it's clear (to
  you and your team) from the diagram what the processor is.
* To disambiguate, add an extra letter or a `.`. Or use the common abbreviation
  of the language (e.g. `PY`, `JS`, `RB`).
* For Lambda processors, prefix the language code with an `L`, or draw the lambda
  lines inside the circle and write the language code in the upper right segment.

{% include diagram.html name="processors_examples" alt="Examples of processors" %}

### Single letter (ambiguous)

| Code | Means                 |
| ---- | --------------------- |
| P    | Python or PHP         |
| R    | R or Ruby             |
| J    | JavaScript or Java    |
| C    | C, C++ or C#          |
| L    | Lambda or Lua         |
| Q    | Query                 |

### Disambiguated

| Language   | Code |
| ---------- | ---- |
| PHP        | PHP  |
| Python     | PY   |
| R          | R.   |
| Ruby       | RB   |
| JavaScript | JS   |
| Java       | J.   |
| Lua        | L.   |
| C          | C.   |
| C++        | C+   |
| C#         | C#   |

### Lambda

| Processor             | Code                                        |
| --------------------- | ------------------------------------------- |
| Lambda                | `L`, `λ`, or the lambda lines in the circle |
| Lambda JavaScript     | `LN` (Node), or lambda lines + `JS`         |
| Lambda Python         | `LP`, or lambda lines + `P`                 |
| Lambda C#             | `LC`                                        |

## What’s in a processor?

A “standard” processor can represent a lot. In the case of a non-lambda processor it can mean that there is a cloud formation stack that creates everything necessary to launch 1 or more instances of the processor in an autoscaling group. It probably also means that there is an automated build and release process, a git repository, cloudwatch logs and all other types luxuries that belong to a piece of software. Not bad for just a circle.

