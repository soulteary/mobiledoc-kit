import { generateBuilder } from 'content-kit-editor/utils/post-builder';
const { module, test } = window.QUnit;
import Renderer from 'content-kit-editor/renderers/editor-dom';
import RenderNode from 'content-kit-editor/models/render-node';
import RenderTree from 'content-kit-editor/models/render-tree';

const DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
let builder;

function render(renderTree) {
  let renderer = new Renderer([]);
  return renderer.render(renderTree);
}

module("Unit: Renderer", {
  beforeEach() {
    builder = generateBuilder();
  }
});

test("It renders a dirty post", (assert) => {
  /*
   * renderTree is:
   *
   * renderNode
   *
   */
  let renderNode = new RenderNode(builder.generatePost());
  let renderTree = new RenderTree(renderNode);
  renderNode.renderTree = renderTree;

  render(renderTree);

  assert.ok(renderTree.node.element, 'renderTree renders element for post');
  assert.ok(!renderTree.node.isDirty, 'dirty node becomes clean');
  assert.equal(renderTree.node.element.tagName, 'DIV', 'renderTree renders element for post');
});

test("It renders a dirty post with un-rendered sections", (assert) => {
  let post = builder.generatePost();
  let sectionA = builder.generateSection('P');
  post.appendSection(sectionA);
  let sectionB = builder.generateSection('P');
  post.appendSection(sectionB);

  let renderNode = new RenderNode(post);
  let renderTree = new RenderTree(renderNode);
  renderNode.renderTree = renderTree;

  render(renderTree);

  assert.equal(renderTree.node.element.outerHTML, '<div><p></p><p></p></div>',
               'correct HTML is rendered');

  assert.ok(renderTree.node.firstChild,
            'sectionA creates a first child');
  assert.equal(renderTree.node.firstChild.postNode, sectionA,
               'sectionA is first renderNode child');
  assert.ok(!renderTree.node.firstChild.isDirty, 'sectionA node is clean');
  assert.equal(renderTree.node.lastChild.postNode, sectionB,
               'sectionB is second renderNode child');
  assert.ok(!renderTree.node.lastChild.isDirty, 'sectionB node is clean');
});

[
  {
    name: 'markup',
    section: (builder) => builder.generateSection('P')
  },
  {
    name: 'image',
    section: (builder) => builder.generateImageSection(DATA_URL)
  },
  {
    name: 'card',
    section: (builder) => builder.generateCardSection('new-card')
  }
].forEach((testInfo) => {
  test(`Remove nodes with ${testInfo.name} section`, (assert) => {
    let post = builder.generatePost();
    let section = testInfo.section(builder);
    post.appendSection(section);

    let postElement = document.createElement('div');
    let sectionElement = document.createElement('p');
    postElement.appendChild(sectionElement);

    let postRenderNode = new RenderNode(post);

    let renderTree = new RenderTree(postRenderNode);
    postRenderNode.renderTree = renderTree;
    postRenderNode.element = postElement;

    let sectionRenderNode = renderTree.buildRenderNode(section);
    sectionRenderNode.element = sectionElement;
    sectionRenderNode.scheduleForRemoval();
    postRenderNode.appendChild(sectionRenderNode);

    render(renderTree);

    assert.equal(renderTree.node.element, postElement,
                 'post element remains');

    assert.equal(renderTree.node.element.firstChild, null,
                 'section element removed');

    assert.equal(renderTree.node.firstChild, null,
                 'section renderNode is removed');
  });
});

test('renders a post with marker', (assert) => {
  let post = builder.generatePost();
  let section = builder.generateSection('P');
  post.appendSection(section);
  section.markers.push(
    builder.generateMarker([
      builder.generateMarkerType('STRONG')
    ], 1, 'Hi')
  );

  let node = new RenderNode(post);
  let renderTree = new RenderTree(node);
  node.renderTree = renderTree;
  render(renderTree);
  assert.equal(node.element.innerHTML, '<p><strong>Hi</strong></p>');
});

test('renders a post with image', (assert) => {
  let url = DATA_URL;
  let post = builder.generatePost();
  let section = builder.generateImageSection(url);
  post.appendSection(section);

  let node = new RenderNode(post);
  let renderTree = new RenderTree(node);
  node.renderTree = renderTree;
  render(renderTree);
  assert.equal(node.element.innerHTML, `<img src="${url}">`);
});

/*
test("It renders a renderTree with rendered dirty section", (assert) => {
  /*
   * renderTree is:
   *
   *      post<dirty>
   *       /        \
   *      /          \
   * section      section<dirty>
   *
  let post = builder.generatePost
  let postRenderNode = {
    element: null,
    parent: null,
    isDirty: true,
    postNode: builder.generatePost()
  }
  let renderTree = {
    node: renderNode
  }

  render(renderTree);

  assert.ok(renderTree.node.element, 'renderTree renders element for post');
  assert.ok(!renderTree.node.isDirty, 'dirty node becomes clean');
  assert.equal(renderTree.node.element.tagName, 'DIV', 'renderTree renders element for post');
});
*/
