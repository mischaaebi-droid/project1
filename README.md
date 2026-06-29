# Idea and Concept

For my first project, I wanted to measure the influence of members of the Swiss Parliament.

I found an API that provides detailed information about parliamentary activity. Like the United States, Switzerland has a bicameral parliament consisting of the **National Council** and the **Council of States**.

Members of Parliament can influence politics in several ways. The most important are **motions** and **postulates**, which are formal proposals submitted to Parliament. If a proposal wins a majority, it is considered a political success and becomes an official mandate for the government.

I argue that, over the course of a legislative term, the number of successful proposals is a good indicator of a politician's influence.

Members can also submit **interpellations**, which are official questions that the government is required to answer. Unlike motions and postulates, interpellations do not measure political success but rather how active a politician is.

---

# Method

I wrote a Python script in **JupyterLab** to request the data from the API. The script retrieves all parliamentary activities for an entire calendar year, including every member, their proposals, and the current status of each case.

**Data collection**

* `project1_api_get_affaires_data`

Using **Pandas**, I analysed and reorganised the data to show:

* the number of motions submitted by each politician
* the number of postulates submitted by each politician
* the number of interpellations submitted by each politician
* the number of successful proposals
* the total number of parliamentary initiatives over the entire legislative term

### Portrait scraping

I wrote Python scripts to scrape the portrait photo of every member of Parliament and save the images in an `img` folder.

Because the National Council and the Council of States have separate member directories, I created two scripts:

* `project1_scrap_council-pic_Nationalrat.py`
* `project1_scrap_council-pic_Standerat.py`

### Biographical data scraping

Using the same approach, I created two additional scripts to scrape the members' biographical data:

* `project1_scrap_council-json_Nationalrat.py`
* `project1_scrap_council-json_Standerat.py`

### Website

Finally, I built a website in **HTML** to publish the results.

I implemented the visualisations in **JavaScript** and created an interactive tool that allows users to explore the activity and success rate of every member of Parliament and compare them with the most influential politicians.

---

# Analysis and Results

The analysis showed that—measured by the number of successful motions and postulates—a parliamentarian who is largely unknown across much of Switzerland is in fact the country's most influential member of parliament, both in absolute terms and in terms of relative success rate.

At the same time, the analysis revealed that some parliamentarians are extremely active, submitting a large number of motions and parliamentary questions, yet fail to achieve a single successful outcome.

---

# What I Learned

Working with the API and scraping the data was relatively straightforward. One thing I had not realised before was that it is possible to scrape and save image files themselves, not just links to the images.

The biggest challenge at first was deciding how to present the data. My initial idea was to use simple bar charts. During a mentoring session, however, I received two valuable suggestions:

1. Represent motions and interpellations as small squares rather than bars.
2. Use a ranked-card layout inspired by a *Washington Post* article.

In the final version, I focused on the two most influential politicians while allowing readers to look up any other member individually through the interactive tool, similar to the approach used by the *Washington Post* in one of its sports rankings.

The most time-consuming part of the project was refining the JavaScript visualisations. I already had a solid understanding of HTML and CSS, and some basic JavaScript knowledge. I also used ChatGPT to help with individual JavaScript functions.

Optimising the interface for mobile devices proved to be particularly challenging.
